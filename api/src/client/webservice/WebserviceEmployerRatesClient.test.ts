import { DummyLogWriter } from "@libs/logWriter";
import { WebserviceEmployerRatesClient } from "@client/webservice/WebserviceEmployerRatesClient";
import axios from "axios";
import { EmployerRatesClient } from "@domain/types";
import { generateEmployerRatesRequestData, generateEmployerRatesResponse } from "@shared/test";
import { getConfigValue } from "@libs/ssmUtils";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@libs/ssmUtils", () => ({
  getConfigValue: jest.fn(),
}));

describe("WebserviceEmployerRatesClient", () => {
  let client: EmployerRatesClient;
  const mockedGetConfigValue = getConfigValue as jest.MockedFunction<typeof getConfigValue>;

  beforeEach(() => {
    jest.resetAllMocks();

    client = WebserviceEmployerRatesClient(DummyLogWriter);
    mockedGetConfigValue.mockResolvedValue("https://example.test");
  });

  it("sends a post request and receives valid response", async () => {
    const requestData = generateEmployerRatesRequestData({});
    const mockResponse = generateEmployerRatesResponse({});
    mockAxios.post.mockResolvedValue({ data: mockResponse });

    const result = await client.getEmployerRates(requestData);
    expect(getConfigValue).toHaveBeenCalledWith("boomi-runtime/alb-url");
    expect(mockAxios.post).toHaveBeenCalledWith(
      "https://example.test/ws/simple/queryDeptOfLaborEmployerRates",
      requestData,
    );
    expect(result).toEqual(mockResponse);
  });

  it("throws the upstream response status when axios returns an error with response", async () => {
    const requestData = generateEmployerRatesRequestData({});
    const axiosError = { response: { status: 502 } };
    mockAxios.post.mockRejectedValue(axiosError);
    await expect(client.getEmployerRates(requestData)).rejects.toBe(502);
  });
});
