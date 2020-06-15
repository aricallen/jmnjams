const express = require('express');
const { get } = require('lodash');
const { getConnection, getRecords } = require('../utils/db-helpers');
const { adapter } = require('../adapters/stripe');
const { updateProductInventory } = require('../utils/inventory');

const router = express.Router();

/**
 * get prices + products from stripe and combine with inventory quanitity to return to FE for shop
 * stripe products are not tied to prices, but prices have a `product` prop which
 * is the product.id
 */
router.get('/products', async (req, res) => {
  try {
    const { data: prices } = await adapter.prices.list();
    const { data: products } = await adapter.products.list();
    const conn = await getConnection();
    const productIds = products.map((p) => p.id);
    await updateProductInventory(conn, productIds);
    const inventory = await getRecords(conn, 'inventory');
    const records = products
      .filter((product) => get(product, 'metadata.type') === 'fundraiser')
      .map((product) => {
        const priceForProduct = prices.find((price) => price.product === product.id);
        const qtyForProduct = inventory.find((item) => item.productId === product.id);
        return {
          ...product,
          price: get(priceForProduct, 'unit_amount'), // in cents
          quantity: qtyForProduct,
        };
      });
    return res.send({ data: records });
  } catch (err) {
    const message = 'error fetching products for fundraiser';
    res.status(400).send({ error: err, message });
    throw new Error(message);
  }
});

module.exports = { router };