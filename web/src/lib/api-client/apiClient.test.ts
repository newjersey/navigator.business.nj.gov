import { generateInputFile } from "@/test/factories";
import { taskIdLicenseNameMapping } from "@businessnjgovnavigator/shared/";
import { randomElementFromArray } from "@businessnjgovnavigator/shared/arrayHelpers";
import { LicenseTaskId } from "@businessnjgovnavigator/shared/license";
import {
  generateLicenseSearchNameAndAddress,
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

  it("posts license status without licenseTaskId specified", async () => {
    mockAxios.post.mockResolvedValue({ data: {} });
    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    await checkLicenseStatus(nameAndAddress);
    expect(mockAxios.post).toHaveBeenCalledWith(
      "/api/license-status",
      { nameAndAddress },
      {
        headers: { Authorization: "Bearer some-token" },
      }
    );
  });

  it("posts license status with licenseTaskId specified", async () => {
    mockAxios.post.mockResolvedValue({ data: {} });
    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    const licenseTaskId = randomElementFromArray(Object.keys(taskIdLicenseNameMapping));
    await checkLicenseStatus(nameAndAddress);
    expect(mockAxios.post).toHaveBeenCalledWith(
      "/api/license-status",
      { nameAndAddress},
      {
        headers: { Authorization: "Bearer some-token" },
      }
    );
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
