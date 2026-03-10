import {
  GovDeliveryCommCloudClientType,
  syncNewsletterSubscription,
} from "@domain/newsletter/syncNewsletterSubscription";
import { NewsletterResponse } from "@shared/businessUser";
import { generateUserData } from "@shared/test";
import { UserData } from "@shared/userData";

const SUCCESS_RESPONSE: NewsletterResponse = { success: true, status: "SUCCESS" };
const FAILURE_RESPONSE: NewsletterResponse = { success: false, status: "CONNECTION_ERROR" };

const buildUserData = (
  overrides: Partial<{
    receiveNewsletter: boolean;
    email: string;
    newsletterEmail: string | undefined;
    newsletterSuccess: boolean | undefined;
  }>,
): UserData => {
  const {
    receiveNewsletter = false,
    email = "user@example.com",
    newsletterEmail,
    newsletterSuccess,
  } = overrides;
  const userData = generateUserData({});
  return {
    ...userData,
    user: {
      ...userData.user,
      email,
      receiveNewsletter,
      newsletterEmail,
      externalStatus: {
        ...userData.user.externalStatus,
        newsletter:
          newsletterSuccess === undefined
            ? undefined
            : { success: newsletterSuccess, status: "SUCCESS" },
      },
    },
  };
};

describe("syncNewsletterSubscription", () => {
  let mockClient: jest.Mocked<GovDeliveryCommCloudClientType>;

  beforeEach(() => {
    mockClient = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      updateEmail: jest.fn(),
    };
  });

  describe("Case A: receiveNewsletter=true, no effectiveNewsletterEmail", () => {
    it("calls subscribe and sets newsletterEmail and externalStatus on success", async () => {
      mockClient.subscribe.mockResolvedValueOnce(SUCCESS_RESPONSE);
      const oldUserData = buildUserData({ receiveNewsletter: false });
      const newUserData = buildUserData({ receiveNewsletter: true, email: "user@example.com" });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(mockClient.subscribe).toHaveBeenCalledWith("user@example.com");
      expect(result.user.newsletterEmail).toBe("user@example.com");
      expect(result.user.externalStatus.newsletter?.success).toBe(true);
    });

    it("clears externalStatus.newsletter on subscribe failure", async () => {
      mockClient.subscribe.mockResolvedValueOnce(FAILURE_RESPONSE);
      const oldUserData = buildUserData({ receiveNewsletter: false });
      const newUserData = buildUserData({ receiveNewsletter: true, email: "user@example.com" });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(result.user.newsletterEmail).toBeUndefined();
      expect(result.user.externalStatus.newsletter?.success).toBe(false);
    });
  });

  describe("Case B: receiveNewsletter=true, effectiveNewsletterEmail === current email", () => {
    it("is a no-op and returns userData unchanged", async () => {
      const userData = buildUserData({
        receiveNewsletter: true,
        email: "user@example.com",
        newsletterEmail: "user@example.com",
      });

      const result = await syncNewsletterSubscription(userData, userData, mockClient);

      expect(mockClient.subscribe).not.toHaveBeenCalled();
      expect(mockClient.unsubscribe).not.toHaveBeenCalled();
      expect(mockClient.updateEmail).not.toHaveBeenCalled();
      expect(result).toEqual(userData);
    });
  });

  describe("Case C: receiveNewsletter=true, effectiveNewsletterEmail !== current email", () => {
    it("calls updateEmail and sets newsletterEmail to new email on success", async () => {
      mockClient.updateEmail.mockResolvedValueOnce(SUCCESS_RESPONSE);
      const oldUserData = buildUserData({
        receiveNewsletter: true,
        email: "old@example.com",
        newsletterEmail: "old@example.com",
      });
      const newUserData = buildUserData({
        receiveNewsletter: true,
        email: "new@example.com",
        newsletterEmail: "old@example.com",
      });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(mockClient.updateEmail).toHaveBeenCalledWith("old@example.com", "new@example.com");
      expect(result.user.newsletterEmail).toBe("new@example.com");
    });

    it("preserves old newsletterEmail on updateEmail failure to enable retry", async () => {
      mockClient.updateEmail.mockResolvedValueOnce(FAILURE_RESPONSE);
      const oldUserData = buildUserData({
        receiveNewsletter: true,
        email: "old@example.com",
        newsletterEmail: "old@example.com",
      });
      const newUserData = buildUserData({
        receiveNewsletter: true,
        email: "new@example.com",
        newsletterEmail: "old@example.com",
      });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(result.user.newsletterEmail).toBe("old@example.com");
    });
  });

  describe("Case D: receiveNewsletter=false, effectiveNewsletterEmail exists", () => {
    it("calls unsubscribe and clears newsletterEmail and externalStatus on success", async () => {
      mockClient.unsubscribe.mockResolvedValueOnce(SUCCESS_RESPONSE);
      const userData = buildUserData({
        receiveNewsletter: false,
        email: "user@example.com",
        newsletterEmail: "user@example.com",
        newsletterSuccess: true,
      });

      const result = await syncNewsletterSubscription(userData, userData, mockClient);

      expect(mockClient.unsubscribe).toHaveBeenCalledWith("user@example.com");
      expect(result.user.newsletterEmail).toBeUndefined();
      expect(result.user.externalStatus.newsletter).toBeUndefined();
    });

    it("preserves newsletterEmail on unsubscribe failure to enable retry", async () => {
      mockClient.unsubscribe.mockResolvedValueOnce(FAILURE_RESPONSE);
      const userData = buildUserData({
        receiveNewsletter: false,
        email: "user@example.com",
        newsletterEmail: "user@example.com",
      });

      const result = await syncNewsletterSubscription(userData, userData, mockClient);

      expect(result.user.newsletterEmail).toBe("user@example.com");
    });
  });

  describe("Case E: receiveNewsletter=false, no effectiveNewsletterEmail", () => {
    it("is a no-op and returns userData unchanged", async () => {
      const userData = buildUserData({ receiveNewsletter: false });

      const result = await syncNewsletterSubscription(userData, userData, mockClient);

      expect(mockClient.subscribe).not.toHaveBeenCalled();
      expect(mockClient.unsubscribe).not.toHaveBeenCalled();
      expect(mockClient.updateEmail).not.toHaveBeenCalled();
      expect(result).toEqual(userData);
    });
  });

  describe("backward-compat: user subscribed before newsletterEmail field existed", () => {
    it("Case B - treats user as having effectiveNewsletterEmail equal to their current email when externalStatus.newsletter.success=true and no newsletterEmail", async () => {
      // User was subscribed via the old batch flow - has success status but no newsletterEmail
      const userData = buildUserData({
        receiveNewsletter: true,
        email: "user@example.com",
        newsletterEmail: undefined,
        newsletterSuccess: true,
      });

      const result = await syncNewsletterSubscription(userData, userData, mockClient);

      // Should be a no-op (Case B) since effectiveNewsletterEmail === current email
      expect(mockClient.subscribe).not.toHaveBeenCalled();
      expect(mockClient.updateEmail).not.toHaveBeenCalled();
      expect(result).toEqual(userData);
    });

    it("Case C - calls updateEmail using current email as old identifier when user changes email and has no newsletterEmail", async () => {
      mockClient.updateEmail.mockResolvedValueOnce(SUCCESS_RESPONSE);
      // Old data: subscribed via batch, no newsletterEmail, email was "old@example.com"
      const oldUserData = buildUserData({
        receiveNewsletter: true,
        email: "old@example.com",
        newsletterEmail: undefined,
        newsletterSuccess: true,
      });
      // New data: email changed but newsletterEmail still not set
      const newUserData = buildUserData({
        receiveNewsletter: true,
        email: "new@example.com",
        newsletterEmail: undefined,
        newsletterSuccess: true,
      });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(mockClient.updateEmail).toHaveBeenCalledWith("old@example.com", "new@example.com");
      expect(result.user.newsletterEmail).toBe("new@example.com");
    });
  });
});
