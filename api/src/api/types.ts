export interface ExpressRequestBody<T> extends Express.Request {
  body: T;
  method: string;
  originalUrl: string;
}
