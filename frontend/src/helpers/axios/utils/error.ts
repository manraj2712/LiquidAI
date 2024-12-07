import axios, { AxiosError } from 'axios';

export const handleError = (error: unknown) => {
  if (axios.isCancel(error)) {
    console.log('Request canceled', error.message);
  } else if (error instanceof AxiosError) {
    console.error('Error in axios request', error?.response?.status, error.response?.statusText);
  }
  return {
    status: 'error',
  };
};
