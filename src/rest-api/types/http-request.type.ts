export type HttpRequestType = {
  language?: string;
  url: string;
  config?: {
    headers: {
      'Accept-Language': string;
    };
  };
};
