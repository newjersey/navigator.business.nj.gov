/**
 * Fetch-compatible function used by the API Gateway load balancer proxy.
 */
export type FetchRequest = (input: URL, init: RequestInit) => Promise<Response>;

/**
 * Application Load Balancer event fields consumed by the API Gateway proxy Lambda.
 */
export interface ApiGatewayLoadBalancerEvent {
  /** HTTP method supplied by the load balancer, such as GET, POST, PUT, PATCH, or DELETE. */
  readonly httpMethod: string;

  /** Request path supplied by the load balancer; optional only for malformed test events. */
  readonly path?: string;

  /** Single-value request headers supplied by the load balancer; optional when no headers exist. */
  readonly headers?: Record<string, string | undefined>;

  /** Multi-value request headers supplied by the load balancer; optional when no headers repeat. */
  readonly multiValueHeaders?: Record<string, readonly string[] | undefined>;

  /** Single-value query string parameters supplied by the load balancer; optional when absent. */
  readonly queryStringParameters?: Record<string, string | undefined>;

  /** Multi-value query string parameters supplied by the load balancer; optional when absent. */
  readonly multiValueQueryStringParameters?: Record<string, readonly string[] | undefined>;

  /** Request body supplied by the load balancer; optional for methods without a body. */
  readonly body?: string | null;

  /** True when the body is base64 encoded by the load balancer; optional and defaults to false. */
  readonly isBase64Encoded?: boolean;
}

/**
 * Application Load Balancer Lambda response shape returned by the proxy.
 */
export interface ApiGatewayLoadBalancerResponse {
  /** HTTP status code returned to the load balancer. */
  readonly statusCode: number;

  /** HTTP status line returned to the load balancer; optional when the status code is enough. */
  readonly statusDescription?: string;

  /** Response headers returned to the load balancer; optional when no headers are needed. */
  readonly headers?: Record<string, string>;

  /** Response body returned to the load balancer; optional when the response is empty. */
  readonly body?: string;

  /** True when the response body is base64 encoded; optional and defaults to false. */
  readonly isBase64Encoded?: boolean;
}

/**
 * Dependencies and request data required to proxy an ALB request to API Gateway.
 */
export interface ProxyApiGatewayRequestProps {
  /** Application Load Balancer event to forward to the regional REST API. */
  readonly event: ApiGatewayLoadBalancerEvent;

  /** Base URL of the deployed REST API stage, such as https://id.execute-api.region.amazonaws.com/dev/. */
  readonly apiGatewayBaseUrl: string;

  /** Fetch-compatible HTTP client used to send the upstream request. */
  readonly fetchRequest: FetchRequest;
}

/**
 * Header names that cannot be safely forwarded through a reverse proxy.
 */
const NON_FORWARDABLE_HEADER_NAMES = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

/** Content types that can be returned to ALB as plain text. */
const TEXT_RESPONSE_CONTENT_TYPES = [
  "application/json",
  "application/problem+json",
  "application/x-www-form-urlencoded",
  "application/xml",
  "text/",
];

const requireApiGatewayBaseUrl = (): string => {
  const apiGatewayBaseUrl = process.env.API_GATEWAY_PROXY_BASE_URL;

  if (apiGatewayBaseUrl === undefined || apiGatewayBaseUrl.trim().length === 0) {
    throw new Error("Missing required env var: API_GATEWAY_PROXY_BASE_URL");
  }

  return apiGatewayBaseUrl;
};

const normalizeApiGatewayBaseUrl = (apiGatewayBaseUrl: string): string => {
  return apiGatewayBaseUrl.endsWith("/") ? apiGatewayBaseUrl : `${apiGatewayBaseUrl}/`;
};

const normalizeRequestPath = (path: string | undefined): string => {
  return path === undefined ? "" : path.replace(/^\/+/, "");
};

const appendSingleValueQueryParameters = (
  targetUrl: URL,
  queryStringParameters: Record<string, string | undefined> | undefined,
): void => {
  for (const [name, value] of Object.entries(queryStringParameters ?? {})) {
    if (value !== undefined) {
      targetUrl.searchParams.append(name, value);
    }
  }
};

const appendMultiValueQueryParameters = (
  targetUrl: URL,
  queryStringParameters: Record<string, readonly string[] | undefined> | undefined,
): void => {
  for (const [name, values] of Object.entries(queryStringParameters ?? {})) {
    for (const value of values ?? []) {
      targetUrl.searchParams.append(name, value);
    }
  }
};

const createTargetUrl = (apiGatewayBaseUrl: string, event: ApiGatewayLoadBalancerEvent): URL => {
  const normalizedBaseUrl = normalizeApiGatewayBaseUrl(apiGatewayBaseUrl);
  const targetUrl = new URL(normalizeRequestPath(event.path), normalizedBaseUrl);

  if (event.multiValueQueryStringParameters !== undefined) {
    appendMultiValueQueryParameters(targetUrl, event.multiValueQueryStringParameters);
    return targetUrl;
  }

  appendSingleValueQueryParameters(targetUrl, event.queryStringParameters);
  return targetUrl;
};

const isForwardableHeader = (name: string): boolean => {
  return !NON_FORWARDABLE_HEADER_NAMES.has(name.toLowerCase());
};

const createForwardedHeaders = (event: ApiGatewayLoadBalancerEvent): Record<string, string> => {
  const forwardedHeaders: Record<string, string> = {};

  for (const [name, value] of Object.entries(event.headers ?? {})) {
    if (value !== undefined && isForwardableHeader(name)) {
      forwardedHeaders[name] = value;
    }
  }

  for (const [name, values] of Object.entries(event.multiValueHeaders ?? {})) {
    if (isForwardableHeader(name)) {
      forwardedHeaders[name] = values?.join(", ") ?? "";
    }
  }

  return forwardedHeaders;
};

const methodCanIncludeBody = (method: string): boolean => {
  return method !== "GET" && method !== "HEAD";
};

const createForwardedBody = (
  event: ApiGatewayLoadBalancerEvent,
): RequestInit["body"] | undefined => {
  if (event.body === undefined || event.body === null || !methodCanIncludeBody(event.httpMethod)) {
    return undefined;
  }

  return event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
};

const createFetchInit = (event: ApiGatewayLoadBalancerEvent): RequestInit => {
  return {
    method: event.httpMethod,
    headers: createForwardedHeaders(event),
    body: createForwardedBody(event),
  };
};

const isTextResponse = (contentType: string | null): boolean => {
  if (contentType === null) {
    return true;
  }

  for (const textContentType of TEXT_RESPONSE_CONTENT_TYPES) {
    if (contentType.toLowerCase().includes(textContentType)) {
      return true;
    }
  }

  return false;
};

const createResponseHeaders = (response: Response): Record<string, string> => {
  const responseHeaders: Record<string, string> = {};

  for (const [name, value] of response.headers.entries()) {
    if (isForwardableHeader(name)) {
      responseHeaders[name] = value;
    }
  }

  return responseHeaders;
};

const createProxyResponse = async (response: Response): Promise<ApiGatewayLoadBalancerResponse> => {
  const contentType = response.headers.get("content-type");

  if (isTextResponse(contentType)) {
    return {
      statusCode: response.status,
      statusDescription: `${response.status} ${response.statusText}`,
      headers: createResponseHeaders(response),
      body: await response.text(),
      isBase64Encoded: false,
    };
  }

  return {
    statusCode: response.status,
    statusDescription: `${response.status} ${response.statusText}`,
    headers: createResponseHeaders(response),
    body: Buffer.from(await response.arrayBuffer()).toString("base64"),
    isBase64Encoded: true,
  };
};

const createProxyFailureResponse = (): ApiGatewayLoadBalancerResponse => {
  return {
    statusCode: 502,
    statusDescription: "502 Bad Gateway",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Failed to proxy request to API Gateway." }),
    isBase64Encoded: false,
  };
};

/**
 * Forward an Application Load Balancer Lambda event to the configured API Gateway REST API.
 */
export const proxyApiGatewayRequest = async (
  props: ProxyApiGatewayRequestProps,
): Promise<ApiGatewayLoadBalancerResponse> => {
  try {
    const targetUrl = createTargetUrl(props.apiGatewayBaseUrl, props.event);
    const response = await props.fetchRequest(targetUrl, createFetchInit(props.event));

    return await createProxyResponse(response);
  } catch {
    return createProxyFailureResponse();
  }
};

/**
 * Lambda entry point used by the API Gateway internal load balancer.
 */
export const handler = async (
  event: ApiGatewayLoadBalancerEvent,
): Promise<ApiGatewayLoadBalancerResponse> => {
  return await proxyApiGatewayRequest({
    event,
    apiGatewayBaseUrl: requireApiGatewayBaseUrl(),
    fetchRequest: fetch,
  });
};
