import { generateInputFile } from "@/test/factories";
import {
  generateLicenseSearchNameAndAddress,
  generateTaxIdAndBusinessName,
  generateUser,
  generateUserData,
} from "@businessnjgovnavigator/shared/test";
import axios from "axios";
import {
  checkEmployerRates,
  checkLicenseStatus,
  get,
  getUserData,
  postBusinessFormation,
  postNewsletter,
  postTaxClearanceCertificate,
  postTaxFilingsLookup,
  postTaxFilingsOnboarding,
  postUserData,
  postUserEmailCheck,
} from "./apiClient";
import {
  generateEmployerRatesRequestData,
  generateEmployerRatesResponse,
} from "@businessnjgovnavigator/shared";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@/lib/auth/sessionHelper", () => ({
  getCurrentToken: (): string => "some-token",
}));

describe("apiClient", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls to the api to get user data", async () => {
    const userData = generateUserData({});
    mockAxios.get.mockResolvedValue({ data: userData });
    expect(await getUserData("123")).toEqual(userData);
    expect(mockAxios.get).toHaveBeenCalledWith("/api/users/123", {
      headers: { Authorization: "Bearer some-token" },
    });
  });

  it("posts user data by id", async () => {
    const userData = generateUserData({ user: generateUser({ id: "456" }) });
    mockAxios.post.mockResolvedValue({ data: userData });
    expect(await postUserData(userData)).toEqual(userData);
    expect(mockAxios.post).toHaveBeenCalledWith("/api/users", userData, {
      headers: { Authorization: "Bearer some-token" },
    });
  });

  it("gets generic data", async () => {
    mockAxios.get.mockResolvedValue({ data: { value: "something" } });
    expect(await get("/some/url")).toEqual({ value: "something" });
    expect(mockAxios.get).toHaveBeenCalledWith("/api/some/url", {
      headers: { Authorization: "Bearer some-token" },
    });
  });

  it("posts email check", async () => {
    const email = "someone@example.com";
    mockAxios.post.mockResolvedValue({ data: { email, found: true } });
    const response = await postUserEmailCheck(email);
    expect(response).toEqual({ email, found: true });
    expect(mockAxios.post).toHaveBeenCalledWith("/api/users/emailCheck", { email }, {});
  });

  it("posts license status", async () => {
    mockAxios.post.mockResolvedValue({ data: {} });
    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    await checkLicenseStatus(nameAndAddress);
    expect(mockAxios.post).toHaveBeenCalledWith(
      "/api/license-status",
      { nameAndAddress },
      {
        headers: { Authorization: "Bearer some-token" },
      },
    );
  });

  it("posts taxFilings onboarding request", async () => {
    mockAxios.post.mockResolvedValue({ data: {} });
    const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
    await postTaxFilingsOnboarding(taxIdAndBusinessName);
    expect(mockAxios.post).toHaveBeenCalledWith(
      "/api/taxFilings/onboarding",
      taxIdAndBusinessName,
      {
        headers: { Authorization: "Bearer some-token" },
      },
    );
  });

  it("posts taxFilings lookup request", async () => {
    mockAxios.post.mockResolvedValue({ data: {} });
    const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
    await postTaxFilingsLookup(taxIdAndBusinessName);
    expect(mockAxios.post).toHaveBeenCalledWith("/api/taxFilings/lookup", taxIdAndBusinessName, {
      headers: { Authorization: "Bearer some-token" },
    });
  });

  it("posts user data without token", async () => {
    const userData = generateUserData({ user: generateUser({ id: "456" }) });
    mockAxios.post.mockResolvedValue({ data: userData });
    expect(await postNewsletter(userData)).toEqual(userData);
    expect(mockAxios.post).toHaveBeenCalledWith("/api/external/newsletter", userData, {});
  });

  it("posts business formation request", async () => {
    const inputUserData = generateUserData({});
    const responseUserData = generateUserData({});
    const returnUrl = "/i-came-from-here.com";
    const inputFile = generateInputFile({});

    mockAxios.post.mockResolvedValue({ data: responseUserData });
    expect(await postBusinessFormation(inputUserData, returnUrl, inputFile)).toEqual(
      responseUserData,
    );
    expect(mockAxios.post).toHaveBeenCalledWith(
      "/api/formation",
      { userData: inputUserData, returnUrl, foreignGoodStandingFile: inputFile },
      { headers: { Authorization: "Bearer some-token" } },
    );
  });

  it("posts tax clearance certificate request", async () => {
    const userData = generateUserData({ user: generateUser({}) });
    mockAxios.post.mockResolvedValue({ data: userData });
    expect(await postTaxClearanceCertificate(userData)).toEqual(userData);
    expect(mockAxios.post).toHaveBeenCalledWith("/api/postTaxClearanceCertificate", userData, {
      headers: { Authorization: "Bearer some-token" },
    });
  });

  it("gets employer rates request", async () => {
    const employerRatesRequest = generateEmployerRatesRequestData({});
    const userData = generateUserData({});
    const employerRatesResponse = generateEmployerRatesResponse({});
    mockAxios.post.mockResolvedValue({ data: employerRatesResponse });

    expect(await checkEmployerRates({ employerRates: employerRatesRequest, userData })).toEqual(
      employerRatesResponse,
    );

    expect(mockAxios.post).toHaveBeenCalledWith(
      "/api/checkEmployerRates",
      { employerRates: employerRatesRequest, userData },
      {
        headers: { Authorization: "Bearer some-token" },
      },
    );
  });
});
