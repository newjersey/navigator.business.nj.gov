import { generateInputFile } from "@/test/factories";
import {
  generateNameAndAddress,
  generateTaxIdAndBusinessName,
  generateUser,
  generateUserData,
} from "@businessnjgovnavigator/shared/test";
import axios from "axios";
import {
  checkLicenseStatus,
  get,
  getUserData,
  postBusinessFormation,
  postFeedback,
  postIssue,
  postNewsletter,
  postTaxFilingsLookup,
  postTaxFilingsOnboarding,
  postUserData,
} from "./apiClient";

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

  it("posts license status", async () => {
    mockAxios.post.mockResolvedValue({ data: {} });
    const nameAndAddress = generateNameAndAddress({});
    await checkLicenseStatus(nameAndAddress);
    expect(mockAxios.post).toHaveBeenCalledWith("/api/license-status", nameAndAddress, {
      headers: { Authorization: "Bearer some-token" },
    });
  });

  it("posts taxFilings onboarding request", async () => {
    mockAxios.post.mockResolvedValue({ data: {} });
    const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
    await postTaxFilingsOnboarding(taxIdAndBusinessName);
    expect(mockAxios.post).toHaveBeenCalledWith("/api/taxFilings/onboarding", taxIdAndBusinessName, {
      headers: { Authorization: "Bearer some-token" },
    });
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

  it("posts feedback request", async () => {
    const userData = generateUserData({});
    const feedbackRequest = {
      browser: "Firefox v.6.5",
      device: "Mac OS 10 Google Pixel Mobile",
      screenWidth: "500 px",
      detail: "random text",
      pageOfRequest: "roadmap/test",
    };

    mockAxios.post.mockResolvedValue({ data: true });
    expect(await postFeedback(feedbackRequest, userData)).toEqual(true);
    expect(mockAxios.post).toHaveBeenCalledWith("/api/external/feedback", { feedbackRequest, userData }, {});
  });

  it("posts issue request", async () => {
    const userData = generateUserData({});
    const issueRequest = {
      context: "some context",
      browser: "Firefox v.6.5",
      device: "Mac OS 10 Google Pixel Mobile",
      screenWidth: "500 px",
      detail: "random text",
      pageOfRequest: "roadmap/test",
    };

    mockAxios.post.mockResolvedValue({ data: true });
    expect(await postIssue(issueRequest, userData)).toEqual(true);
    expect(mockAxios.post).toHaveBeenCalledWith("/api/external/issue", { issueRequest, userData }, {});
  });

  it("posts business formation request", async () => {
    const inputUserData = generateUserData({});
    const responseUserData = generateUserData({});
    const returnUrl = "/i-came-from-here.com";
    const inputFile = generateInputFile({});

    mockAxios.post.mockResolvedValue({ data: responseUserData });
    expect(await postBusinessFormation(inputUserData, returnUrl, inputFile)).toEqual(responseUserData);
    expect(mockAxios.post).toHaveBeenCalledWith(
      "/api/formation",
      { userData: inputUserData, returnUrl, foreignGoodStandingFile: inputFile },
      { headers: { Authorization: "Bearer some-token" } }
    );
  });
});
