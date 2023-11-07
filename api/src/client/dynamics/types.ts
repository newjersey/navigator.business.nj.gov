export interface AccessTokenClient {
  getAccessToken: () => Promise<string>;
}
