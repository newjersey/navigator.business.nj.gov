import { UserData, UserDataClient, UserHandler } from "../types";
import { userHandlerFactory } from "./userHandlerFactory";
import {
  generateLicenseData,
  generateLicenseStatusItem,
  generateLicenseStatusResult,
  generateOnboardingData,
  generateUserData,
} from "../factories";
import dayjs from "dayjs";

describe("userHandler", () => {
  let userHandler: UserHandler;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let stubSearchLicenseStatus: jest.Mock;

  beforeEach(async () => {
    jest.resetAllMocks();
    stubSearchLicenseStatus = jest.fn();
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
    };
    userHandler = userHandlerFactory(stubUserDataClient, stubSearchLicenseStatus);
  });

  it("gets from user data client", async () => {
    const userData = generateUserData({});
    stubUserDataClient.get.mockResolvedValue(userData);
    const result = await userHandler.get("some-id");
    expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
    expect(result).toEqual(userData);
  });

  it("puts to the user data client", async () => {
    const sentUserData = generateUserData({});
    const returnedUserData = generateUserData({});
    stubUserDataClient.put.mockResolvedValue(returnedUserData);

    const result = await userHandler.put(sentUserData);
    expect(stubUserDataClient.put).toHaveBeenCalledWith(sentUserData);
    expect(result).toEqual(returnedUserData);
  });

  it("updates the user data with existing values and new partial", async () => {
    const gotUserData = generateUserData({ formProgress: "UNSTARTED" });
    const returnedUserData = generateUserData({});
    stubUserDataClient.get.mockResolvedValue(gotUserData);
    stubUserDataClient.put.mockResolvedValue(returnedUserData);

    const result = await userHandler.update("some-id", { formProgress: "COMPLETED" });
    expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
    expect(stubUserDataClient.put).toHaveBeenCalledWith({ ...gotUserData, formProgress: "COMPLETED" });
    expect(result).toEqual(returnedUserData);
  });

  describe("updating the license status", () => {
    it("does not search license if licenseData is undefined", async () => {
      const userData = generateUserData({ licenseData: undefined });
      stubUserDataClient.get.mockResolvedValue(userData);

      await userHandler.get("some-id");
      expect(stubSearchLicenseStatus).not.toHaveBeenCalled();
    });

    it("does not search license if licenseData lastCheckedDate is within the last hour", async () => {
      const userData = generateUserData({
        licenseData: generateLicenseData({
          lastCheckedStatus: dayjs().subtract(1, "hour").add(1, "minute").toISOString(),
        }),
      });
      stubUserDataClient.get.mockResolvedValue(userData);

      await userHandler.get("some-id");
      expect(stubSearchLicenseStatus).not.toHaveBeenCalled();
    });

    it("searches license if licenseData lastCheckedDate is older than last hour", async () => {
      const userData = generateUserData({
        onboardingData: generateOnboardingData({
          industry: "home-contractor",
        }),
        licenseData: generateLicenseData({
          lastCheckedStatus: dayjs().subtract(1, "hour").subtract(1, "minute").toISOString(),
        }),
      });
      stubUserDataClient.get.mockResolvedValue(userData);
      stubSearchLicenseStatus.mockResolvedValue(generateLicenseStatusResult({}));

      await userHandler.get("some-id");
      expect(stubSearchLicenseStatus).toHaveBeenCalled();
    });

    describe("when searching for license status", () => {
      let userData: UserData;
      beforeEach(() => {
        userData = generateUserData({
          onboardingData: generateOnboardingData({
            industry: "home-contractor",
          }),
          licenseData: generateLicenseData({
            lastCheckedStatus: dayjs().subtract(1, "hour").subtract(1, "minute").toISOString(),
          }),
        });
        stubUserDataClient.get.mockResolvedValue(userData);
        stubUserDataClient.put.mockImplementation((userData: UserData): Promise<UserData> => {
          return Promise.resolve(userData);
        });
      });

      it("searches for license status with user data criteria", async () => {
        stubSearchLicenseStatus.mockResolvedValue(generateLicenseStatusResult({}));
        await userHandler.get("some-id");
        expect(stubSearchLicenseStatus).toHaveBeenCalledWith({
          name: userData.licenseData?.nameAndAddress.name,
          addressLine1: userData.licenseData?.nameAndAddress.addressLine1,
          addressLine2: userData.licenseData?.nameAndAddress.addressLine2,
          zipCode: userData.licenseData?.nameAndAddress.zipCode,
          licenseType: "Home Improvement Contractors",
        });
      });

      it("updates the user license data based on the search results", async () => {
        const checklistItems = [generateLicenseStatusItem({})];
        stubSearchLicenseStatus.mockResolvedValue({
          status: "ACTIVE",
          checklistItems: checklistItems,
        });

        const resultUserData = await userHandler.get("some-id");

        expect(resultUserData.licenseData?.nameAndAddress).toEqual(userData.licenseData?.nameAndAddress);
        expect(resultUserData.licenseData?.completedSearch).toEqual(userData.licenseData?.completedSearch);
        expect(
          dayjs(resultUserData.licenseData?.lastCheckedStatus as string).isSame(dayjs(), "minute")
        ).toEqual(true);
        expect(resultUserData.licenseData?.status).toEqual("ACTIVE");
        expect(resultUserData.licenseData?.items).toEqual(checklistItems);

        expect(stubUserDataClient.put).toHaveBeenCalledWith(resultUserData);
      });

      it("updates the license task status to NOT_STARTED when license not found", async () => {
        stubSearchLicenseStatus.mockRejectedValue("NO MATCH");

        const resultUserData = await userHandler.get("some-id");

        expect(resultUserData.taskProgress["apply-for-shop-license"]).toEqual("NOT_STARTED");
        expect(resultUserData.taskProgress["register-consumer-affairs"]).toEqual("NOT_STARTED");
      });

      it("updates the license task status to IN_PROGRESS when license is pending", async () => {
        stubSearchLicenseStatus.mockResolvedValue({
          status: "PENDING",
          checklistItems: [],
        });

        const resultUserData = await userHandler.get("some-id");

        expect(resultUserData.taskProgress["apply-for-shop-license"]).toEqual("IN_PROGRESS");
        expect(resultUserData.taskProgress["register-consumer-affairs"]).toEqual("IN_PROGRESS");
      });

      it("updates the license task status to COMPLETED when license is active", async () => {
        stubSearchLicenseStatus.mockResolvedValue({
          status: "ACTIVE",
          checklistItems: [],
        });

        const resultUserData = await userHandler.get("some-id");

        expect(resultUserData.taskProgress["apply-for-shop-license"]).toEqual("COMPLETED");
        expect(resultUserData.taskProgress["register-consumer-affairs"]).toEqual("COMPLETED");
      });
    });
  });
});
