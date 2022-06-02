import { generateNameAndAddress, generateUser, generateUserData } from "@/test/factories";
import axios from "axios";
import {
  checkLicenseStatus,
  get,
  getUserData,
  postFeedback,
  postIssue,
  postNewsletter,
  postUserData,
} from "./apiClient";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@/lib/auth/sessionHelper", () => ({
  getCurrentToken: () => "some-token",
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
});
