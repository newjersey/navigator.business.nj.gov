import { proxyApiGatewayRequest } from "@functions/apiGatewayLoadBalancerProxy/app";
import type {
  ApiGatewayLoadBalancerEvent,
  FetchRequest,
} from "@functions/apiGatewayLoadBalancerProxy/app";

interface CapturedFetchCall {
  /** URL requested by the proxy. */
  readonly input: URL;

  /** Request options sent by the proxy. */
  readonly init: RequestInit;
}

interface CapturedFetch {
  /** Fetch-compatible function that captures every call. */
  readonly fetchRequest: FetchRequest;

  /** Calls captured by the fetch-compatible function. */
  readonly calls: CapturedFetchCall[];
}

interface CreateCapturedFetchProps {
  /** Response returned by the fetch-compatible function. */
  readonly response: Response;
}

const createCapturedFetch = (props: CreateCapturedFetchProps): CapturedFetch => {
  const calls: CapturedFetchCall[] = [];
  const fetchRequest: FetchRequest = async (input: URL, init: RequestInit): Promise<Response> => {
    calls.push({ input, init });

    return props.response;
  };

  return { fetchRequest, calls };
};

const createBaseEvent = (): ApiGatewayLoadBalancerEvent => {
  return {
    httpMethod: "GET",
    path: "/health",
    headers: {
      accept: "application/json",
      host: "internal-api-alb.example.com",
    },
    queryStringParameters: undefined,
    body: undefined,
    isBase64Encoded: false,
  };
};

/** Fetch-compatible function that simulates an upstream network failure. */
const failingFetchRequest: FetchRequest = async (): Promise<Response> => {
  throw new Error("network unavailable");
};

describe("apiGatewayLoadBalancerProxy", () => {
  test("forwards method, path, query string, headers, and body to the REST API", async () => {
    const capturedFetch = createCapturedFetch({
      response: new Response(JSON.stringify({ ok: true }), {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
      }),
    });
    const event: ApiGatewayLoadBalancerEvent = {
      ...createBaseEvent(),
      httpMethod: "POST",
      path: "/api/users",
      headers: {
        authorization: "Bearer token",
        "content-length": "20",
        "content-type": "application/json",
        host: "internal-api-alb.example.com",
      },
      queryStringParameters: {
        search: "business",
      },
      body: JSON.stringify({ name: "Navigator" }),
    };

    const response = await proxyApiGatewayRequest({
      event,
      apiGatewayBaseUrl: "https://abc123.execute-api.us-east-1.amazonaws.com/dev/",
      fetchRequest: capturedFetch.fetchRequest,
    });

    expect(capturedFetch.calls).toHaveLength(1);
    expect(capturedFetch.calls[0].input.toString()).toBe(
      "https://abc123.execute-api.us-east-1.amazonaws.com/dev/api/users?search=business",
    );
    expect(capturedFetch.calls[0].init).toMatchObject({
      method: "POST",
      headers: {
        authorization: "Bearer token",
        "content-type": "application/json",
      },
      body: JSON.stringify({ name: "Navigator" }),
    });
    expect(capturedFetch.calls[0].init.headers).not.toMatchObject({
      "content-length": "20",
      host: "internal-api-alb.example.com",
    });
    expect(response).toMatchObject({
      statusCode: 200,
      statusDescription: "200 OK",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ ok: true }),
      isBase64Encoded: false,
    });
  });

  test("preserves base64-encoded request bodies", async () => {
    const capturedFetch = createCapturedFetch({
      response: new Response("created", {
        status: 201,
        statusText: "Created",
        headers: { "content-type": "text/plain" },
      }),
    });
    const event: ApiGatewayLoadBalancerEvent = {
      ...createBaseEvent(),
      httpMethod: "PUT",
      path: "/api/documents",
      body: Buffer.from("encoded-body").toString("base64"),
      isBase64Encoded: true,
    };

    const response = await proxyApiGatewayRequest({
      event,
      apiGatewayBaseUrl: "https://abc123.execute-api.us-east-1.amazonaws.com/dev",
      fetchRequest: capturedFetch.fetchRequest,
    });

    expect(capturedFetch.calls[0].input.toString()).toBe(
      "https://abc123.execute-api.us-east-1.amazonaws.com/dev/api/documents",
    );
    expect(capturedFetch.calls[0].init.body).toEqual(Buffer.from("encoded-body"));
    expect(response.statusCode).toBe(201);
  });

  test("uses multi-value query parameters when they are present", async () => {
    const capturedFetch = createCapturedFetch({
      response: new Response("ok", {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "text/plain" },
      }),
    });
    const event: ApiGatewayLoadBalancerEvent = {
      ...createBaseEvent(),
      path: "/api/search",
      multiValueQueryStringParameters: {
        filter: ["formation", "tax"],
      },
      queryStringParameters: {
        filter: "ignored",
      },
    };

    await proxyApiGatewayRequest({
      event,
      apiGatewayBaseUrl: "https://abc123.execute-api.us-east-1.amazonaws.com/dev/",
      fetchRequest: capturedFetch.fetchRequest,
    });

    expect(capturedFetch.calls[0].input.toString()).toBe(
      "https://abc123.execute-api.us-east-1.amazonaws.com/dev/api/search?filter=formation&filter=tax",
    );
  });

  test("returns a clear bad gateway response when the upstream request fails", async () => {
    const response = await proxyApiGatewayRequest({
      event: createBaseEvent(),
      apiGatewayBaseUrl: "https://abc123.execute-api.us-east-1.amazonaws.com/dev/",
      fetchRequest: failingFetchRequest,
    });

    expect(response).toEqual({
      statusCode: 502,
      statusDescription: "502 Bad Gateway",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Failed to proxy request to API Gateway." }),
      isBase64Encoded: false,
    });
  });
});
