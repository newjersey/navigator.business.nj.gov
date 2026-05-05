/**
 * Header prefix used by HTTP Basic auth credentials.
 *
 * Basic auth is intentionally a deployment-only guard for shared non-production
 * environments, so a simple standard header check is enough here.
 */
const BASIC_AUTH_HEADER_PREFIX = "Basic ";

/** Credentials used to authorize a Basic Auth request. */
export interface BasicAuthCredentials {
  /** Username expected in the Basic Auth header. This value is required when Basic Auth is enabled. */
  readonly username: string;

  /** Password expected in the Basic Auth header. This value is required when Basic Auth is enabled. */
  readonly password: string;
}

/** Inputs for checking whether a request satisfies Basic Auth. */
export interface IsBasicAuthAuthorizedProps {
  /** Value of the request `Authorization` header. Pass `null` when the header is absent. */
  readonly authorizationHeader: string | null;

  /** Credentials the request must match to be authorized. */
  readonly credentials: BasicAuthCredentials;
}

/**
 * Result of decoding the Basic Auth header payload.
 */
type BasicAuthDecodeResult =
  | {
      readonly type: "valid";
      readonly credentials: BasicAuthCredentials;
    }
  | {
      readonly type: "invalid";
    };

/**
 * Decodes a Basic Auth credential payload.
 */
const decodeBasicAuthPayload = (payload: string): BasicAuthDecodeResult => {
  try {
    const decodedPayload = atob(payload);
    const separatorIndex = decodedPayload.indexOf(":");

    if (separatorIndex < 0) {
      return { type: "invalid" };
    }

    return {
      type: "valid",
      credentials: {
        username: decodedPayload.slice(0, separatorIndex),
        password: decodedPayload.slice(separatorIndex + 1),
      },
    };
  } catch {
    return { type: "invalid" };
  }
};

/**
 * Checks whether a request's Basic Auth header matches the configured credentials.
 */
export const isBasicAuthAuthorized = (props: IsBasicAuthAuthorizedProps): boolean => {
  if (!props.authorizationHeader?.startsWith(BASIC_AUTH_HEADER_PREFIX)) {
    return false;
  }

  const payload = props.authorizationHeader.slice(BASIC_AUTH_HEADER_PREFIX.length);
  const decodeResult = decodeBasicAuthPayload(payload);

  if (decodeResult.type === "invalid") {
    return false;
  }

  return (
    decodeResult.credentials.username === props.credentials.username &&
    decodeResult.credentials.password === props.credentials.password
  );
};
