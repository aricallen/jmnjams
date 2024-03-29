const express = require('express');
const { omit, pick, sum } = require('lodash');
const { getConnection, updateRecord, updateRecordBy } = require('../utils/db-helpers');
const { sendEmail, serializeForEmail, addMember } = require('../utils/email-helpers');
const { adapter: emailListAdapter } = require('../adapters/email-list');
const { adapter: stripeAdapter } = require('../adapters/stripe');
const {
  STRIPE_PUBLISHABLE_KEY,
  HOST,
  PORT,
  TARGET_ENV,
  DEBUG_EMAIL,
} = require('../utils/environment');

const router = express.Router();

const getAmountOff = (coupon, price, qty) => {
  if (!coupon) {
    return 0;
  }
  if (coupon.amountOff) {
    return coupon.amountOff / qty;
  }
  return (coupon.percentOff / 100) * price;
};

const serializeLineItems = (cartItems, coupons) => {
  const coupon = coupons.find(({ metadata }) => metadata.type === 'price');
  const totalQty = sum(cartItems.map(({ selectedQty }) => selectedQty));
  return cartItems.map((item) => {
    const { product, selectedQty } = item;
    const amountOff = getAmountOff(coupon, product.price, totalQty);
    const discountedPrice = Math.round(product.price - amountOff);
    return {
      ...pick(product, ['name', 'description']),
      currency: 'usd',
      quantity: selectedQty,
      amount: +discountedPrice,
      description: product.name,
    };
  });
};

/**
 * create checkout session
 * return session.id to FE to use for redirecting to hosted checkout form
 */
router.post('/', async (req, res) => {
  const { formValues, cartItems, sessionUser, coupons = [] } = req.body;
  const host = TARGET_ENV === 'production' ? HOST : `${HOST}:${PORT}`;
  const customerValues =
    sessionUser && sessionUser.paymentCustomerId
      ? { customer: sessionUser.paymentCustomerId }
      : { customer_email: formValues.email };
  try {
    const checkoutSession = await stripeAdapter.checkout.sessions.create({
      ...customerValues,
      payment_method_types: ['card'],
      payment_intent_data: {
        setup_future_usage: 'off_session',
      },
      line_items: serializeLineItems(cartItems, coupons),
      submit_type: 'auto',
      billing_address_collection: 'auto',
      metadata: coupons.reduce((acc, curr) => {
        acc[curr.metadata.type] = curr.amountOff;
        return acc;
      }, {}),
      success_url: `${host}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${host}/store/cancel?session_id={CHECKOUT_SESSION_ID}`,
    });

    const responseData = {
      checkoutSession,
      formValues: omit(formValues, ['password', 'confirmPassword']),
      cartItems,
      coupons,
      sessionKey: STRIPE_PUBLISHABLE_KEY,
    };

    // add to current session for FE
    req.session[checkoutSession.id] = responseData;

    res.send({
      data: responseData,
    });
  } catch (err) {
    res.status(400).send({
      error: err,
      message: 'Unable to create checkout session',
    });
  }
});

const updateStripeCustomer = async (
  customerId,
  formValues,
  checkoutSessionRecord,
  sessionUser,
  coupons
) => {
  const shippingFullName = `${formValues.firstName} ${formValues.lastName}`;
  const customerFullName = `${sessionUser.firstName} ${sessionUser.lastName}`;
  const { address, address2, zipCode } = formValues;
  const description = checkoutSessionRecord.display_items
    .map((item) => item.custom.description)
    .join(' - ');
  const priceCoupon = coupons.find((c) => c.metadata.type === 'price');
  const deliveryCoupon = coupons.find((c) => c.metadata.type === 'delivery');
  try {
    const customerRecord = await stripeAdapter.customers.update(customerId, {
      description,
      name: customerFullName,
      shipping: {
        address: {
          line1: address,
          line2: address2,
          postal_code: zipCode,
        },
        name: shippingFullName,
      },
      metadata: {
        shipping_instructions: formValues.shippingInstructions,
        deliveryCoupon: deliveryCoupon ? deliveryCoupon.name : 'n/a',
        priceCoupon: priceCoupon ? priceCoupon.name : 'n/a',
      },
    });
    return customerRecord;
  } catch (err) {
    const subject = 'Unable to update stripe customer record during checkout';
    console.error(subject, err);
    const message = serializeForEmail({ err, sessionUser, checkoutSessionRecord, formValues });
    sendEmail({ message, to: DEBUG_EMAIL, subject });
  }
};

const updateJJUserRecord = async (sessionUserId, formValues, customerId) => {
  try {
    const conn = await getConnection();
    const updatedValues = {
      ...pick(formValues, ['firstName', 'lastName', 'email']),
      isActive: true,
      paymentCustomerId: customerId,
    };
    const updated = await updateRecord(conn, 'users', sessionUserId, updatedValues);
    return updated;
  } catch (err) {
    const subject = 'Unable to update JJ user record during checkout';
    console.error(subject, err);
    const message = serializeForEmail({ err, sessionUserId, formValues, customerId });
    sendEmail({ message, to: DEBUG_EMAIL, subject });
    if (err.fatal) {
      await getConnection();
    }
  }
};

const addToEmailLists = async (formValues) => {
  try {
    const tags = ['active_subscription'];
    if (formValues.newsletterSignup) {
      tags.push('Newsletter');
    }
    return addMember({ ...formValues, tags }, emailListAdapter);
  } catch (err) {
    const subject = 'Unable to add user to email lists during checkout';
    console.error(subject, err);
    const message = serializeForEmail({ err, formValues });
    sendEmail({ message, to: DEBUG_EMAIL, subject });
  }
};

const updatePaymentIntent = async (checkoutSessionRecord, appliedCoupons) => {
  const paymentIntentId = checkoutSessionRecord.payment_intent;
  const priceCoupon = appliedCoupons.find((c) => c.metadata.type === 'price');
  const product = checkoutSessionRecord.display_items
    .map((item) => `${item.custom.name} (${item.custom.description})`.trim())
    .join(' - ');
  try {
    const updated = await stripeAdapter.paymentIntents.update(paymentIntentId, {
      metadata: {
        couponName: priceCoupon ? priceCoupon.name : 'n/a',
        discount: priceCoupon ? priceCoupon.amountOff : 'n/a',
        product,
      },
    });
    return updated;
  } catch (err) {
    console.error('unable to update payment intent', err);
  }
};

const updateInventory = async (cartItems) => {
  try {
    const conn = await getConnection();
    const newInventoryRows = cartItems.map((item) => {
      const { product, selectedQty } = item;
      return {
        productId: product.id,
        productName: product.name,
        quantity: product.quantity - selectedQty,
      };
    });
    newInventoryRows.forEach(async (row) => {
      await updateRecordBy(conn, 'inventory', 'productId', row.productId, row);
    });
  } catch (err) {
    if (err.fatal) {
      await getConnection();
    }
  }
};

/**
 * find customer for completed checkout
 * create jj user record with related customer.id
 * add shipping info to customer record
 * update customer description with product info e.g. "Bimonthly"
 */
router.post('/success', async (req, res) => {
  const { formValues, sessionId, sessionUser } = req.body;
  const { coupons: appliedCoupons, cartItems } = req.session[sessionId];
  try {
    const checkoutSessionRecord = await stripeAdapter.checkout.sessions.retrieve(sessionId);
    const { customer: customerId } = checkoutSessionRecord;
    const customerRecord = await updateStripeCustomer(
      customerId,
      formValues,
      checkoutSessionRecord,
      sessionUser,
      appliedCoupons
    );
    const updatedSessionUser = await updateJJUserRecord(sessionUser.id, formValues, customerId);
    // const updatedInventory = await updateInventory(formValues);
    await updatePaymentIntent(checkoutSessionRecord, appliedCoupons);
    await addToEmailLists(formValues);
    await updateInventory(cartItems);
    res.send({
      data: {
        checkoutSession: checkoutSessionRecord,
        sessionUser: {
          ...updatedSessionUser,
          customer: customerRecord,
        },
      },
    });
  } catch (err) {
    res.status(400).send({
      error: 'Unable to resolve databases',
      message: 'Error occured while attempting to process checkout',
    });
  }
});

module.exports = { router };
