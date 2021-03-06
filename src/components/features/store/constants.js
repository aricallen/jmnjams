export const PRODUCTS_ID = [
  {
    id: null,
    label: 'Frequency / Quantity',
    text: '1 Jar',
  },
  {
    id: 1,
    label: 'Every month',
    text: '$11.99',
  },
  {
    id: 2,
    label: 'Every 2 months',
    text: '$12.99',
  },
  {
    id: 3,
    label: 'Every 3 months',
    text: '$12.99',
  },
];

export const StoreStep = {
  PRODUCTS_ID: 'products',
  DELIVERY_METHOD: 'delivery-method',
  SHIPPING: 'shipping',
  PAYMENT: 'payment',
};

const OAK = [
  '94601',
  '94602',
  '94606',
  '94607',
  '94608',
  '94609',
  '94610',
  '94611',
  '94612',
  '94618',
  '94620',
];

const BERK = [
  '94702',
  '94703',
  '94704',
  '94705',
  '94706',
  '94707',
  '94708',
  '94709',
  '94710',
  '94720',
];

const EAST = [
  '94523', // pleasant hill
  '94518',
  '94549', // lafayette
  '94556', // moraga
  '94563', // orinda
  '94516', // canyon
  '94507', // alamo
  '94595', // walnut creek
  '94596',
  '94597',
  '94598',
  '94530', // el cerrito
  '94501', // alameda
  '94502',
  '94808',
  '94662',
];

export const VALID_ZIPCODES = [...OAK, ...BERK, ...EAST];
// build map via https://www.randymajors.org/

export const Method = {
  PROMO: 'promo',
  LOCAL: 'local',
};
