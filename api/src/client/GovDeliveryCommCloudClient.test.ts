import { GovDeliveryCommCloudClient } from "@client/GovDeliveryCommCloudClient";
import { NewsletterResponse } from "@shared/businessUser";
import axios from "axios";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const config = {
  baseUrl: "https://api.example.com",
  accountCode: "NJTEST",
  username: "testuser",
  password: "testpass",
  topicCode: "TOPIC123",
};

const basicAuthHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;

describe("GovDeliveryCommCloudClient", () => {
  let client: ReturnType<typeof GovDeliveryCommCloudClient>;

  beforeEach(() => {
    client = GovDeliveryCommCloudClient(config);
    jest.resetAllMocks();
  });

  describe("XML escaping", () => {
    it("escapes & in email for subscribe", async () => {
      mockAxios.post.mockResolvedValueOnce({ status: 200 });
      await client.subscribe("bad&actor@example.com");
      const body = mockAxios.post.mock.calls[0][1] as string;
      expect(body).toContain("<email>bad&amp;actor@example.com</email>");
    });

    it("escapes < and > in email for subscribe", async () => {
      mockAxios.post.mockResolvedValueOnce({ status: 200 });
      await client.subscribe("bad<>actor@example.com");
      const body = mockAxios.post.mock.calls[0][1] as string;
      expect(body).toContain("<email>bad&lt;&gt;actor@example.com</email>");
    });

    it("escapes & in email for unsubscribe", async () => {
      mockAxios.delete.mockResolvedValueOnce({ status: 200 });
      await client.unsubscribe("bad&actor@example.com");
      const body = (mockAxios.delete.mock.calls[0][1] as { data: string }).data;
      expect(body).toContain("<email>bad&amp;actor@example.com</email>");
    });

    it("escapes & in newEmail for updateEmail", async () => {
      mockAxios.put.mockResolvedValueOnce({ status: 200 });
      await client.updateEmail("old@example.com", "bad&actor@example.com");
      const body = mockAxios.put.mock.calls[0][1] as string;
      expect(body).toContain("<email>bad&amp;actor@example.com</email>");
    });
  });

  describe("subscribe", () => {
    it("POSTs to subscriptions.xml with correct XML body and returns success", async () => {
      mockAxios.post.mockResolvedValueOnce({ status: 200 });

      const result: NewsletterResponse = await client.subscribe("test@example.com");

      expect(result).toEqual({ success: true, status: "SUCCESS" });
      expect(mockAxios.post).toHaveBeenCalledWith(
        `${config.baseUrl}/api/account/${config.accountCode}/subscriptions.xml`,
        expect.stringContaining("<email>test@example.com</email>"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: basicAuthHeader,
            "Content-Type": "application/xml",
          }),
        }),
      );
    });

    it("includes the topic code in the subscribe XML body", async () => {
      mockAxios.post.mockResolvedValueOnce({ status: 200 });

      await client.subscribe("test@example.com");

      const body = mockAxios.post.mock.calls[0][1] as string;
      expect(body).toContain(`<code>${config.topicCode}</code>`);
    });

    it("returns CONNECTION_ERROR when axios throws on subscribe", async () => {
      mockAxios.post.mockRejectedValueOnce(new Error("network error"));

      const result: NewsletterResponse = await client.subscribe("test@example.com");

      expect(result).toEqual({ success: false, status: "CONNECTION_ERROR" });
    });

    it("returns RESPONSE_ERROR when axios throws with an HTTP response on subscribe", async () => {
      mockAxios.post.mockRejectedValueOnce({ response: { status: 422 } });

      const result: NewsletterResponse = await client.subscribe("test@example.com");

      expect(result).toEqual({ success: false, status: "RESPONSE_ERROR" });
    });
  });

  describe("unsubscribe", () => {
    it("sends DELETE to subscriptions.xml with correct XML body and returns success", async () => {
      mockAxios.delete.mockResolvedValueOnce({ status: 200 });

      const result: NewsletterResponse = await client.unsubscribe("test@example.com");

      expect(result).toEqual({ success: true, status: "SUCCESS" });
      expect(mockAxios.delete).toHaveBeenCalledWith(
        `${config.baseUrl}/api/account/${config.accountCode}/subscriptions.xml`,
        expect.objectContaining({
          data: expect.stringContaining("<email>test@example.com</email>"),
          headers: expect.objectContaining({
            Authorization: basicAuthHeader,
            "Content-Type": "application/xml",
          }),
        }),
      );
    });

    it("includes the topic code in the unsubscribe XML body", async () => {
      mockAxios.delete.mockResolvedValueOnce({ status: 200 });

      await client.unsubscribe("test@example.com");

      const body = (mockAxios.delete.mock.calls[0][1] as { data: string }).data;
      expect(body).toContain(`<code>${config.topicCode}</code>`);
    });

    it("returns CONNECTION_ERROR when axios throws on unsubscribe", async () => {
      mockAxios.delete.mockRejectedValueOnce(new Error("network error"));

      const result: NewsletterResponse = await client.unsubscribe("test@example.com");

      expect(result).toEqual({ success: false, status: "CONNECTION_ERROR" });
    });

    it("returns RESPONSE_ERROR when axios throws with an HTTP response on unsubscribe", async () => {
      mockAxios.delete.mockRejectedValueOnce({ response: { status: 404 } });

      const result: NewsletterResponse = await client.unsubscribe("test@example.com");

      expect(result).toEqual({ success: false, status: "RESPONSE_ERROR" });
    });
  });

  describe("updateEmail", () => {
    it("PUTs to the encoded subscriber URL with new email and returns success", async () => {
      mockAxios.put.mockResolvedValueOnce({ status: 200 });

      const result: NewsletterResponse = await client.updateEmail(
        "old@example.com",
        "new@example.com",
      );

      expect(result).toEqual({ success: true, status: "SUCCESS" });
      const encodedOldEmail = Buffer.from("old@example.com".toLowerCase()).toString("base64");
      expect(mockAxios.put).toHaveBeenCalledWith(
        `${config.baseUrl}/api/account/${config.accountCode}/subscribers/${encodedOldEmail}.xml`,
        expect.stringContaining("<email>new@example.com</email>"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: basicAuthHeader,
            "Content-Type": "application/xml",
          }),
        }),
      );
    });

    it("lowercases the old email before base64-encoding for the URL", async () => {
      mockAxios.put.mockResolvedValueOnce({ status: 200 });

      await client.updateEmail("OLD@EXAMPLE.COM", "new@example.com");

      const encodedLower = Buffer.from("old@example.com").toString("base64");
      const url = mockAxios.put.mock.calls[0][0] as string;
      expect(url).toContain(encodedLower);
    });

    it("returns CONNECTION_ERROR when axios throws on updateEmail", async () => {
      mockAxios.put.mockRejectedValueOnce(new Error("network error"));

      const result: NewsletterResponse = await client.updateEmail(
        "old@example.com",
        "new@example.com",
      );

      expect(result).toEqual({ success: false, status: "CONNECTION_ERROR" });
    });

    it("returns RESPONSE_ERROR when axios throws with an HTTP response on updateEmail", async () => {
      mockAxios.put.mockRejectedValueOnce({ response: { status: 500 } });

      const result: NewsletterResponse = await client.updateEmail(
        "old@example.com",
        "new@example.com",
      );

      expect(result).toEqual({ success: false, status: "RESPONSE_ERROR" });
    });
  });
});
