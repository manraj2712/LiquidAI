import { AxiosRequestConfig } from 'axios';

export const logApiCurl = (url: string, options: AxiosRequestConfig) => {
  console.log(
    `curl -X ${options.method} ${url} ${options.data ? `-d '${JSON.stringify(options.data)}'` : ''} ${
      options.headers
        ? `-H '${Object.entries(options.headers)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')}'`
        : ''
    }`,
  );
};
