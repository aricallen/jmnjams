import axios from 'axios';
import { parseAxiosError } from '../utils/error';

export const Type = {
  FETCH_MANY_REQUESTED: 'orders/FETCH_REQUESTED',
  FETCH_MANY_SUCCEEDED: 'orders/FETCH_SUCCEEDED',
  FETCH_MANY_FAILED: 'orders/FETCH_FAILED',
};

export const fetchMany = (customerId) => {
  return async (dispatch) => {
    dispatch({ type: Type.FETCH_MANY_REQUESTED });
    try {
      const params = { key: 'customer_id', value: customerId };
      const queryString = new URLSearchParams(params).toString();
      const response = await axios.get(`/api/stripe/orders?${queryString}`);
      const orders = response.data.data;
      dispatch({ type: Type.FETCH_MANY_SUCCEEDED, orders });
      return orders;
    } catch (err) {
      dispatch({ type: Type.FETCH_MANY_FAILED, error: parseAxiosError(err) });
      throw err;
    }
  };
};
