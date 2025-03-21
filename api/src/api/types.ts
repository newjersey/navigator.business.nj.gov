export interface ExpressRequestBody<T> extends Express.Request {
  body: T;
}
