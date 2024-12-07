import axios, { AxiosRequestConfig } from 'axios';
import { logApiCurl } from './utils/curl';

export const callApiWithTimeout = async ({
  url,
  options,
  timeout,
  logCurl,
}: {
  url: string;
  options: AxiosRequestConfig;
  timeout: number;
  logCurl?: boolean;
}) => {
  const source = axios.CancelToken.source();
  const timeoutId = setTimeout(() => {
    source.cancel('Request timed out');
  }, timeout);
  const updatedOptions: AxiosRequestConfig = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  };
  if (logCurl) {
    logApiCurl(url, updatedOptions);
  }
  const response = await axios({
    url,
    ...updatedOptions,
    cancelToken: source.token,
  });
  clearTimeout(timeoutId);
  return response.data;
};

export const callApi = async ({ url, options, logCurl }: { url: string; options: AxiosRequestConfig; logCurl?: boolean }) => {
  const updatedOptions: AxiosRequestConfig = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  };
  if (logCurl) {
    logApiCurl(url, updatedOptions);
  }
  const response = await axios({
    url,
    ...updatedOptions,
  });
  return response.data;
};
