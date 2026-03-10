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
  }>,
): UserData => {
  const { receiveNewsletter = false, email = "user@example.com" } = overrides;
  const userData = generateUserData({});
  return {
    ...userData,
    user: { ...userData.user, email, receiveNewsletter },
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

  describe("receiveNewsletter transitions false→true", () => {
    it("calls subscribe and returns ok:true on success", async () => {
      mockClient.subscribe.mockResolvedValueOnce(SUCCESS_RESPONSE);
      const oldUserData = buildUserData({ receiveNewsletter: false });
      const newUserData = buildUserData({ receiveNewsletter: true, email: "user@example.com" });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(mockClient.subscribe).toHaveBeenCalledWith("user@example.com");
      expect(result).toEqual({ ok: true, userData: newUserData });
    });

    it("returns ok:false with SUBSCRIBE_FAILED on subscribe failure", async () => {
      mockClient.subscribe.mockResolvedValueOnce(FAILURE_RESPONSE);
      const oldUserData = buildUserData({ receiveNewsletter: false });
      const newUserData = buildUserData({ receiveNewsletter: true, email: "user@example.com" });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(result).toEqual({ ok: false, errorType: "SUBSCRIBE_FAILED" });
    });
  });

  describe("receiveNewsletter=true and the user email is unchanged (i.e., already subscribed —> no-op)", () => {
    it("returns ok:true without calling any client method", async () => {
      const userData = buildUserData({ receiveNewsletter: true, email: "user@example.com" });

      const result = await syncNewsletterSubscription(userData, userData, mockClient);

      expect(mockClient.subscribe).not.toHaveBeenCalled();
      expect(mockClient.unsubscribe).not.toHaveBeenCalled();
      expect(mockClient.updateEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ ok: true, userData });
    });
  });

  describe("receiveNewsletter=true, email changed while subscribed", () => {
    it("calls updateEmail with old and new email and returns ok:true on success", async () => {
      mockClient.updateEmail.mockResolvedValueOnce(SUCCESS_RESPONSE);
      const oldUserData = buildUserData({ receiveNewsletter: true, email: "old@example.com" });
      const newUserData = buildUserData({ receiveNewsletter: true, email: "new@example.com" });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(mockClient.updateEmail).toHaveBeenCalledWith("old@example.com", "new@example.com");
      expect(result).toEqual({ ok: true, userData: newUserData });
    });

    it("returns ok:false with EMAIL_UPDATE_FAILED on updateEmail failure", async () => {
      mockClient.updateEmail.mockResolvedValueOnce(FAILURE_RESPONSE);
      const oldUserData = buildUserData({ receiveNewsletter: true, email: "old@example.com" });
      const newUserData = buildUserData({ receiveNewsletter: true, email: "new@example.com" });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(result).toEqual({ ok: false, errorType: "EMAIL_UPDATE_FAILED" });
    });
  });

  describe("receiveNewsletter transitions true→false", () => {
    it("calls unsubscribe with old email and returns ok:true on success", async () => {
      mockClient.unsubscribe.mockResolvedValueOnce(SUCCESS_RESPONSE);
      const oldUserData = buildUserData({ receiveNewsletter: true, email: "user@example.com" });
      const newUserData = buildUserData({ receiveNewsletter: false, email: "user@example.com" });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(mockClient.unsubscribe).toHaveBeenCalledWith("user@example.com");
      expect(result).toEqual({ ok: true, userData: newUserData });
    });

    it("returns ok:false with UNSUBSCRIBE_FAILED on unsubscribe failure", async () => {
      mockClient.unsubscribe.mockResolvedValueOnce(FAILURE_RESPONSE);
      const oldUserData = buildUserData({ receiveNewsletter: true, email: "user@example.com" });
      const newUserData = buildUserData({ receiveNewsletter: false, email: "user@example.com" });

      const result = await syncNewsletterSubscription(oldUserData, newUserData, mockClient);

      expect(result).toEqual({ ok: false, errorType: "UNSUBSCRIBE_FAILED" });
    });
  });

  describe("receiveNewsletter=false, was already unsubscribed (i.e., no action required -> no-op)", () => {
    it("returns ok:true without calling any client method", async () => {
      const userData = buildUserData({ receiveNewsletter: false });

      const result = await syncNewsletterSubscription(userData, userData, mockClient);

      expect(mockClient.subscribe).not.toHaveBeenCalled();
      expect(mockClient.unsubscribe).not.toHaveBeenCalled();
      expect(mockClient.updateEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ ok: true, userData });
    });
  });
});
