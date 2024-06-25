export type HttpRequestType = {
  language: string;
  url: string;
  config: {
    headers: {
      'Accept-Language': string;
    };
  };
};

export type HttpResponseType = {
  product: {
    ean: string;
    title: string;
  };
  source: string;
};
