import axios from "axios";
import { generateNameAndAddress, generateUser, generateUserData } from "@/test/factories";
import { checkLicenseStatus, get, getUserData, postUserData } from "./apiClient";

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
});
