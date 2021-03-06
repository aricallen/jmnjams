import axios from 'axios';

export const addToWaitlist = async (values) => {
  try {
    const result = await axios.post('/api/waitlist', values);
    return result;
  } catch (err) {
    console.log('error posting to waitlist');
    throw err;
  }
};
