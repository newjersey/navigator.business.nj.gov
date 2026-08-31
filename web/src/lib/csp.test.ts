import { buildCmsContentSecurityPolicy, buildContentSecurityPolicy, parseCspMode } from "@/lib/csp";

describe("csp", () => {
  describe("parseCspMode", () => {
    it("defaults to disabled when unset", () => {
      expect(parseCspMode(undefined)).toEqual("disabled");
    });

    it("defaults to disabled when an empty string", () => {
      expect(parseCspMode("")).toEqual("disabled");
    });

    it("accepts report-only", () => {
      expect(parseCspMode("report-only")).toEqual("report-only");
    });

    it("accepts enforce", () => {
      expect(parseCspMode("enforce")).toEqual("enforce");
    });

    it("accepts disabled", () => {
      expect(parseCspMode("disabled")).toEqual("disabled");
    });

    it("throws on an unrecognized value", () => {
      expect(() => parseCspMode("strict")).toThrow(/Invalid CSP_MODE/);
    });
  });

  describe("buildContentSecurityPolicy", () => {
    it("always self-restricts by default", () => {
      const policy = buildContentSecurityPolicy({});
      expect(policy).toContain("default-src 'self'");
    });

    it("allows Google Tag Manager and Intercom in script-src", () => {
      const policy = buildContentSecurityPolicy({});
      expect(policy).toContain("script-src");
      expect(policy).toContain("https://www.googletagmanager.com");
      expect(policy).toContain("https://widget.intercom.io");
      expect(policy).toContain("https://js.intercomcdn.com");
    });

    it("allows the Public Sans and Intercom font hosts in font-src", () => {
      const policy = buildContentSecurityPolicy({});
      expect(policy).toContain("font-src");
      expect(policy).toContain("https://fonts.gstatic.com");
      expect(policy).toContain("https://fonts.intercomcdn.com");
    });

    it("includes the API base URL origin in connect-src, dropping any path", () => {
      const policy = buildContentSecurityPolicy({ apiBaseUrl: "http://localhost:5002/local" });
      expect(policy).toContain("http://localhost:5002");
      expect(policy).not.toContain("http://localhost:5002/local");
    });

    it("includes the Cognito auth domain origin in connect-src", () => {
      const policy = buildContentSecurityPolicy({
        authDomain: "https://businessnjgov-navigator-dev.auth.us-east-1.amazoncognito.com",
      });
      expect(policy).toContain(
        "https://businessnjgov-navigator-dev.auth.us-east-1.amazoncognito.com",
      );
    });

    it("derives Cognito IDP and identity endpoints from the AWS region", () => {
      const policy = buildContentSecurityPolicy({ awsRegion: "us-east-1" });
      expect(policy).toContain("https://cognito-idp.us-east-1.amazonaws.com");
      expect(policy).toContain("https://cognito-identity.us-east-1.amazonaws.com");
    });

    it("includes the outage alert config origin in connect-src, dropping any path", () => {
      const policy = buildContentSecurityPolicy({
        outageAlertConfigUrl: "https://files.business.nj.gov/navigator/config.json",
      });
      expect(policy).toContain("https://files.business.nj.gov");
      expect(policy).not.toContain("/navigator/config.json");
    });

    it("silently omits an unparseable URL rather than producing an invalid directive", () => {
      const policy = buildContentSecurityPolicy({ apiBaseUrl: "not-a-url" });
      expect(policy).not.toContain("not-a-url");
    });

    it("does not duplicate an origin used by multiple options", () => {
      const policy = buildContentSecurityPolicy({
        apiBaseUrl: "https://api.business.nj.gov",
        authDomain: "https://api.business.nj.gov",
      });
      const occurrences = policy.split("https://api.business.nj.gov").length - 1;
      expect(occurrences).toEqual(1);
    });

    it("appends upgrade-insecure-requests outside of development", () => {
      const policy = buildContentSecurityPolicy({ isDevelopment: false });
      expect(policy).toContain("upgrade-insecure-requests");
    });

    it("omits upgrade-insecure-requests in development", () => {
      const policy = buildContentSecurityPolicy({ isDevelopment: true });
      expect(policy).not.toContain("upgrade-insecure-requests");
    });

    it("blocks framing and plugin embeds by default", () => {
      const policy = buildContentSecurityPolicy({});
      expect(policy).toContain("frame-ancestors 'none'");
      expect(policy).toContain("object-src 'none'");
    });
  });

  describe("buildCmsContentSecurityPolicy", () => {
    it("extends the base policy with GitHub and the CMS OAuth gateway", () => {
      const policy = buildCmsContentSecurityPolicy({});
      expect(policy).toContain("https://o5snnsoroh.execute-api.us-east-1.amazonaws.com");
      expect(policy).toContain("https://api.github.com");
      expect(policy).toContain("https://github.com");
    });

    it("does not leave a trailing space on the value-less upgrade-insecure-requests directive", () => {
      const policy = buildCmsContentSecurityPolicy({ isDevelopment: false });
      expect(policy.endsWith("upgrade-insecure-requests")).toBe(true);
      expect(policy.endsWith("upgrade-insecure-requests ")).toBe(false);
    });

    it("still includes base directives such as frame-ancestors", () => {
      const policy = buildCmsContentSecurityPolicy({});
      expect(policy).toContain("frame-ancestors 'none'");
    });

    it("does not duplicate 'self' in a merged directive", () => {
      const policy = buildCmsContentSecurityPolicy({});
      const scriptSrcClause = policy
        .split(";")
        .find((clause) => clause.trim().startsWith("script-src"));
      const selfOccurrences = (scriptSrcClause ?? "").split("'self'").length - 1;
      expect(selfOccurrences).toEqual(1);
    });
  });
});
