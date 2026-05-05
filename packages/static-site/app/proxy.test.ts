import { describe, expect, test } from "vitest";

import { isBasicAuthAuthorized } from "@/proxyAuth";

const createBasicAuthorizationHeader = (username: string, password: string): string => {
  return `Basic ${btoa(`${username}:${password}`)}`;
};

describe("static site proxy Basic Auth", () => {
  test("authorizes a request when Basic Auth credentials match", () => {
    const isAuthorized = isBasicAuthAuthorized({
      authorizationHeader: createBasicAuthorizationHeader("businessuser", "secret"),
      credentials: {
        username: "businessuser",
        password: "secret",
      },
    });

    expect(isAuthorized).toBe(true);
  });

  test("rejects a request when Basic Auth credentials do not match", () => {
    const isAuthorized = isBasicAuthAuthorized({
      authorizationHeader: createBasicAuthorizationHeader("businessuser", "wrong"),
      credentials: {
        username: "businessuser",
        password: "secret",
      },
    });

    expect(isAuthorized).toBe(false);
  });

  test("rejects a request when the authorization header is missing", () => {
    const isAuthorized = isBasicAuthAuthorized({
      authorizationHeader: null,
      credentials: {
        username: "businessuser",
        password: "secret",
      },
    });

    expect(isAuthorized).toBe(false);
  });
});
