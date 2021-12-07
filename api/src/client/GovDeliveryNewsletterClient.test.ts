import { LogWriter, LogWriterType } from "../libs/logWriter";
import axios from "axios";
import { NewsletterClient } from "../domain/types";
import { GovDeliveryResponse, GovDeliveryNewsletterClient } from "./GovDeliveryNewsletterClient";
import { randomInt } from "../../test/factories";

const generateGovDeliveryResponse = (
  overrides: Partial<GovDeliveryResponse>,
  failed = !!(randomInt() % 2)
): GovDeliveryResponse => {
  return {
    citizen_id: failed ? undefined : randomInt(),
    topic_id: "topic1234",
    message: `Subscriber profile ${failed ? "failed" : "successfully created."}`,
    ...overrides,
  };
};

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("GovDeliveryNewsletterClient", () => {
  let client: NewsletterClient;
  let logger: LogWriterType;

  beforeEach(() => {
    logger = LogWriter("NavigatorWebService", "SearchApis", "us-test-1");
    client = GovDeliveryNewsletterClient({
      baseUrl: "www.example.com",
      topic: "123",
      apiKey: "key1234",
      logWriter: logger,
      siteUrl: "navigator.com",
      urlQuestion: "q_1234",
    });
    jest.resetAllMocks();
  });

  it("queries the webservice endpoint with passed data", async () => {
    const returnedData = generateGovDeliveryResponse({}, false);
    mockAxios.get.mockResolvedValue({ data: returnedData });
    expect(await client.add("testuser@xyz.com")).toEqual({ success: true, status: "SUCCESS" });
    expect(mockAxios.get).toHaveBeenCalledWith("www.example.com/api/add_script_subscription", {
      params: { e: "testuser@xyz.com", t: "123", k: "key1234", q_1234: "navigator.com" },
    });
  });

  // The endpoint accepts both standard JSON and a stringified json objects wrapped in parentheses, as per GovDelivery api spec.
  it("queries the webservice endpoint with passed data in parentheses", async () => {
    const returnedData = generateGovDeliveryResponse({}, false);
    mockAxios.get.mockResolvedValue({ data: `(${JSON.stringify(returnedData)})` });
    expect(await client.add("testuser@xyz.com")).toEqual({ success: true, status: "SUCCESS" });
    expect(mockAxios.get).toHaveBeenCalledWith("www.example.com/api/add_script_subscription", {
      params: { e: "testuser@xyz.com", t: "123", k: "key1234", q_1234: "navigator.com" },
    });
  });

  it("returns RESPONSE_FAIL if an error is thrown by axios", async () => {
    mockAxios.get.mockRejectedValueOnce({ message: "something random" });
    expect(await client.add("testuser@xyz.com")).toEqual({ success: false, status: "RESPONSE_FAIL" });
  });

  it("returns EMAIL_ERROR if there is an invalid email", async () => {
    const response = {
      errors: { email: ["Email is invalid"] },
      topic_id: "NJTHING",
      message: "There were problems creating the email profile.",
    };
    mockAxios.get.mockResolvedValue({ data: response });
    expect(await client.add("testuser@xyz.com")).toEqual({ success: false, status: "EMAIL_ERROR" });
  });

  it("returns RESPONSE_ERROR if the request fails gracefully upon malformed response", async () => {
    const response = { message: "Whatever." };
    mockAxios.get.mockResolvedValue({ data: response });
    expect(await client.add("testuser@xyz.com")).toEqual({ success: false, status: "RESPONSE_ERROR" });
  });

  it("returns TOPIC_ERROR if the user was created but the request was unsuccessful as they were not able to be added to the topic", async () => {
    const response = {
      errors: { email: ["Unable to subscribe test@evotest.govdelivery.com to topic NJTHING"] },
      topic_id: "NJTHING",
      message: "There were problems assigning the email profile to the requested topic.",
      citizen_id: 19200,
    };
    mockAxios.get.mockResolvedValue({ data: response });
    expect(await client.add("testuser@xyz.com")).toEqual({ success: false, status: "TOPIC_ERROR" });
  });

  it("it returns QUESTION_WARNING if the user request is successful, they were created, and added to a topic, but their question is not updated", async () => {
    const response = {
      errors: { email: ["Unable update responses for test@sink.govdelivery.com"] },
      topic_id: "NJTHING",
      message: "Subscriber profile successfully created.",
      citizen_id: 19227,
    };
    mockAxios.get.mockResolvedValue({ data: response });
    expect(await client.add("testuser@xyz.com")).toEqual({ success: true, status: "QUESTION_WARNING" });
  });

  it("returns RESPONSE_WARNING if the user request is successful, they were created, and added to a topic, but there is an unknown warning", async () => {
    const response = {
      errors: { email: ["Lorem Ipsum"] },
      topic_id: "NJTHING",
      message: "Subscriber profile successfully created.",
      citizen_id: 19227,
    };
    mockAxios.get.mockResolvedValue({ data: response });
    expect(await client.add("testuser@xyz.com")).toEqual({ success: true, status: "RESPONSE_WARNING" });
  });
});
