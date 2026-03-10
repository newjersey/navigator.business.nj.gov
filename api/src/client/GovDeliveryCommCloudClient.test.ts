import { GovDeliveryCommCloudClient } from "@client/GovDeliveryCommCloudClient";
import { DummyLogWriter } from "@libs/logWriter";
import { GOV_DELIVERY_CONFIG_VARS, getConfigValue } from "@libs/ssmUtils";
import { NewsletterResponse } from "@shared/businessUser";
import axios, { AxiosError } from "axios";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@libs/ssmUtils", () => ({
  getConfigValue: jest.fn(),
}));

jest.mock("@functions/config", () => ({
  STAGE: "test",
  IS_DOCKER: false,
}));

const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  (paramName: GOV_DELIVERY_CONFIG_VARS) => Promise<string>
>;

const mockConfigValues: Record<GOV_DELIVERY_CONFIG_VARS, string> = {
  gov_delivery_base_url: "https://api.example.com",
  gov_delivery_topic: "TOPIC123",
  gov_delivery_comm_cloud_account_code: "NJTEST",
  gov_delivery_comm_cloud_username: "testuser",
  gov_delivery_comm_cloud_password: "testpass",
};

const basicAuthHeader = `Basic ${Buffer.from(`${mockConfigValues.gov_delivery_comm_cloud_username}:${mockConfigValues.gov_delivery_comm_cloud_password}`).toString("base64")}`;

describe("when no password is configured", () => {
  let client: ReturnType<typeof GovDeliveryCommCloudClient>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockGetConfigValue.mockImplementation((paramName) =>
      Promise.resolve(paramName === "gov_delivery_comm_cloud_password" ? "" : "some-value"),
    );
    client = GovDeliveryCommCloudClient(DummyLogWriter);
  });

  it("returns success for subscribe without making any HTTP calls", async () => {
    const result = await client.subscribe("test@example.com");
    expect(result).toEqual({ success: true, status: "SUCCESS" });
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  it("returns success for unsubscribe without making any HTTP calls", async () => {
    const result = await client.unsubscribe("test@example.com");
    expect(result).toEqual({ success: true, status: "SUCCESS" });
    expect(mockAxios.delete).not.toHaveBeenCalled();
  });

  it("returns success for updateEmail without making any HTTP calls", async () => {
    const result = await client.updateEmail("old@example.com", "new@example.com");
    expect(result).toEqual({ success: true, status: "SUCCESS" });
    expect(mockAxios.put).not.toHaveBeenCalled();
  });
});

describe("GovDeliveryCommCloudClient", () => {
  let client: ReturnType<typeof GovDeliveryCommCloudClient>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockGetConfigValue.mockImplementation((paramName) =>
      Promise.resolve(mockConfigValues[paramName]),
    );
    client = GovDeliveryCommCloudClient(DummyLogWriter);
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
    it("POSTs to subscribers.xml then subscriptions.xml and returns success", async () => {
      mockAxios.post.mockResolvedValueOnce({ status: 200 }).mockResolvedValueOnce({ status: 200 });

      const result: NewsletterResponse = await client.subscribe("test@example.com");

      expect(result).toEqual({ success: true, status: "SUCCESS" });
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
      expect(mockAxios.post).toHaveBeenNthCalledWith(
        1,
        `${mockConfigValues.gov_delivery_base_url}/api/account/${mockConfigValues.gov_delivery_comm_cloud_account_code}/subscribers.xml`,
        expect.stringContaining("<email>test@example.com</email>"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: basicAuthHeader,
            "Content-Type": "application/xml",
          }),
        }),
      );
      expect(mockAxios.post).toHaveBeenNthCalledWith(
        2,
        `${mockConfigValues.gov_delivery_base_url}/api/account/${mockConfigValues.gov_delivery_comm_cloud_account_code}/subscriptions.xml`,
        expect.stringContaining("<email>test@example.com</email>"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: basicAuthHeader,
            "Content-Type": "application/xml",
          }),
        }),
      );
    });

    it("does not include topics in the create-subscriber XML body", async () => {
      mockAxios.post.mockResolvedValueOnce({ status: 200 }).mockResolvedValueOnce({ status: 200 });

      await client.subscribe("test@example.com");

      const createSubscriberBody = mockAxios.post.mock.calls[0][1] as string;
      expect(createSubscriberBody).not.toContain("<topics");
      expect(createSubscriberBody).not.toContain("<code>");
    });

    it("includes the topic code in the add-subscription XML body", async () => {
      mockAxios.post.mockResolvedValueOnce({ status: 200 }).mockResolvedValueOnce({ status: 200 });

      await client.subscribe("test@example.com");

      const addSubscriptionBody = mockAxios.post.mock.calls[1][1] as string;
      expect(addSubscriptionBody).toContain(`<code>${mockConfigValues.gov_delivery_topic}</code>`);
    });

    it("still attempts add-subscription even when create-subscriber returns a non-2xx", async () => {
      mockAxios.post.mockResolvedValueOnce({ status: 422 }).mockResolvedValueOnce({ status: 200 });

      const result: NewsletterResponse = await client.subscribe("test@example.com");

      expect(result).toEqual({ success: true, status: "SUCCESS" });
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });

    it("still attempts add-subscription when create-subscriber throws", async () => {
      mockAxios.post
        .mockRejectedValueOnce(new Error("network error"))
        .mockResolvedValueOnce({ status: 200 });

      const result: NewsletterResponse = await client.subscribe("test@example.com");

      expect(result).toEqual({ success: true, status: "SUCCESS" });
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });

    it("returns CONNECTION_ERROR when add-subscription throws", async () => {
      mockAxios.post
        .mockResolvedValueOnce({ status: 200 })
        .mockRejectedValueOnce(new Error("network error"));

      const result: NewsletterResponse = await client.subscribe("test@example.com");

      expect(result).toEqual({ success: false, status: "CONNECTION_ERROR" });
    });

    it("returns RESPONSE_ERROR when add-subscription returns a non-2xx", async () => {
      mockAxios.post.mockResolvedValueOnce({ status: 200 }).mockResolvedValueOnce({ status: 422 });

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
        `${mockConfigValues.gov_delivery_base_url}/api/account/${mockConfigValues.gov_delivery_comm_cloud_account_code}/subscriptions.xml`,
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
      expect(body).toContain(`<code>${mockConfigValues.gov_delivery_topic}</code>`);
    });

    it("returns CONNECTION_ERROR when axios throws a non-HTTP error on unsubscribe", async () => {
      mockAxios.delete.mockRejectedValueOnce(new Error("network error"));

      const result: NewsletterResponse = await client.unsubscribe("test@example.com");

      expect(result).toEqual({ success: false, status: "CONNECTION_ERROR" });
    });

    it("returns SUCCESS when GovDelivery returns 404 (subscriber not found) on unsubscribe", async () => {
      const notFoundError = new AxiosError("Not Found", "ERR_BAD_RESPONSE");
      notFoundError.response = {
        status: 404,
        data: "<error>Subscriber not found</error>",
      } as never;
      mockAxios.delete.mockRejectedValueOnce(notFoundError);

      const result: NewsletterResponse = await client.unsubscribe("test@example.com");

      expect(result).toEqual({ success: true, status: "SUCCESS" });
    });

    it("returns CONNECTION_ERROR when GovDelivery returns a non-404 HTTP error on unsubscribe", async () => {
      const serverError = new AxiosError("Server Error", "ERR_BAD_RESPONSE");
      serverError.response = { status: 500, data: "<error>Internal Server Error</error>" } as never;
      mockAxios.delete.mockRejectedValueOnce(serverError);

      const result: NewsletterResponse = await client.unsubscribe("test@example.com");

      expect(result).toEqual({ success: false, status: "CONNECTION_ERROR" });
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
        `${mockConfigValues.gov_delivery_base_url}/api/account/${mockConfigValues.gov_delivery_comm_cloud_account_code}/subscribers/${encodedOldEmail}.xml`,
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

    it("returns RESPONSE_ERROR on non-2xx HTTP status for updateEmail", async () => {
      mockAxios.put.mockResolvedValueOnce({ status: 500 });

      const result: NewsletterResponse = await client.updateEmail(
        "old@example.com",
        "new@example.com",
      );

      expect(result).toEqual({ success: false, status: "RESPONSE_ERROR" });
    });
  });

  describe("logging", () => {
    it("logs both request URLs and response statuses on successful subscribe", async () => {
      mockAxios.post.mockResolvedValueOnce({ status: 200 }).mockResolvedValueOnce({ status: 200 });
      const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test-id");
      const spyOnLogInfo = jest.spyOn(DummyLogWriter, "LogInfo");

      await client.subscribe("test@example.com");

      const baseUrl = `${mockConfigValues.gov_delivery_base_url}/api/account/${mockConfigValues.gov_delivery_comm_cloud_account_code}`;
      expect(spyOnLogInfo).toHaveBeenCalledWith(
        expect.stringContaining(`${baseUrl}/subscribers.xml`),
      );
      expect(spyOnLogInfo).toHaveBeenCalledWith(
        expect.stringContaining(`${baseUrl}/subscriptions.xml`),
      );
      expect(spyOnLogInfo).toHaveBeenCalledWith(expect.stringContaining("200"));

      spyOnGetId.mockRestore();
      spyOnLogInfo.mockRestore();
    });

    it("logs the axios error status and response body when unsubscribe fails with an HTTP error", async () => {
      const axiosError = new AxiosError("Request failed", "ERR_BAD_RESPONSE");
      axiosError.response = { status: 422, data: "<error>Subscriber not found</error>" } as never;
      mockAxios.delete.mockRejectedValueOnce(axiosError);
      const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test-id");
      const spyOnLogError = jest.spyOn(DummyLogWriter, "LogError");

      await client.unsubscribe("test@example.com");

      expect(spyOnLogError).toHaveBeenCalledWith(expect.stringContaining("422"));
      expect(spyOnLogError).toHaveBeenCalledWith(expect.stringContaining("Subscriber not found"));

      spyOnGetId.mockRestore();
      spyOnLogError.mockRestore();
    });
  });
});
