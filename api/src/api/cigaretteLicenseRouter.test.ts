import { cigaretteLicenseRouterFactory, sendEmailConfirmation } from "@api/cigaretteLicenseRouter";
import {
  mockSuccessPostResponse,
  mockSuccessGetResponse,
  mockErrorGetResponse,
  mockErrorPostResponse,
  mockSuccessEmailResponse,
  mockErrorEmailResponse,
} from "@client/ApiCigaretteLicenseHelpers";
import { getSignedInUserId } from "@api/userRouter";
import { type CryptoClient, DatabaseClient, CigaretteLicenseClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { DummyLogWriter } from "@libs/logWriter";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import {
  generateBusiness,
  generateCigaretteLicenseData,
  generateUserData,
  generateUser,
} from "@shared/test";
import { UserData } from "@shared/userData";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

jest.mock("@api/userRouter", () => {
  return {
    getSignedInUserId: jest.fn(),
  };
});

const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("cigaretteLicenseRouter", () => {
  let app: Express;
  let stubCigaretteLicenseClient: jest.Mocked<CigaretteLicenseClient>;
  let stubDynamoDataClient: jest.Mocked<DatabaseClient>;
  let stubCryptoClient: jest.Mocked<CryptoClient>;
  jest.mock("node:crypto", () => ({
    randomUUID: (): string => "fake-uuid-value",
  }));

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("fake-id");
    stubCigaretteLicenseClient = {
      preparePayment: jest.fn(),
      getOrderByToken: jest.fn(),
      sendEmailConfirmation: jest.fn(),
      health: jest.fn(),
    };
    stubCryptoClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
      hashValue: jest.fn(),
    };
    stubDynamoDataClient = {
      migrateOutdatedVersionUsers: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      findUserByBusinessName: jest.fn(),
      findUsersByBusinessNamePrefix: jest.fn(),
      findBusinessesByHashedTaxId: jest.fn(),
    };
    app = setupExpress(false);
    app.use(
      cigaretteLicenseRouterFactory(
        stubCigaretteLicenseClient,
        stubCryptoClient,
        stubDynamoDataClient,
        DummyLogWriter,
      ),
    );
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  describe("/prepare-payment", () => {
    let userData: UserData;

    beforeEach(() => {
      userData = generateUserData({});
    });

    it("sends posted user data to cigaretteLicense client and returns updated user data with payment response", async () => {
      stubCigaretteLicenseClient.preparePayment.mockResolvedValue(mockSuccessPostResponse);
      const response = await request(app).post("/cigarette-license/prepare-payment").send({
        userData: userData,
        returnUrl: "some-url",
      });

      expect(stubCigaretteLicenseClient.preparePayment).toHaveBeenCalledWith(userData, "some-url");
      expect(response.status).toEqual(StatusCodes.OK);

      const expectedModifiedUserData = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        cigaretteLicenseData: {
          ...business.cigaretteLicenseData,
          paymentInfo: {
            token: mockSuccessPostResponse.token,
          },
        },
      }));
      const expectedResponse = {
        userData: expectedModifiedUserData,
        paymentInfo: mockSuccessPostResponse,
      };

      expect(response.body).toEqual(expectedResponse);
    });

    it("updates user data with response from cigaretteLicense", async () => {
      stubCigaretteLicenseClient.preparePayment.mockResolvedValue(mockSuccessPostResponse);
      const response = await request(app).post("/cigarette-license/prepare-payment").send({
        userData: userData,
        returnUrl: "some-url",
      });

      expect(response.status).toEqual(StatusCodes.OK);

      const expectedModifiedUserData = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        cigaretteLicenseData: {
          ...business.cigaretteLicenseData,
          paymentInfo: {
            token: mockSuccessPostResponse.token,
          },
        },
      }));

      expect(stubDynamoDataClient.put).toHaveBeenCalledWith(expectedModifiedUserData);
    });

    it("returns payment errorResult info if token is not found", async () => {
      stubCigaretteLicenseClient.preparePayment.mockResolvedValue(mockErrorPostResponse);
      const response = await request(app).post("/cigarette-license/prepare-payment").send({
        userData: userData,
        returnUrl: "some-url",
      });

      expect(response.status).toEqual(StatusCodes.OK);

      expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
      expect(response.body).toEqual({ userData, paymentInfo: mockErrorPostResponse });
    });

    it("returns 500 reponse if unknown error occurs", async () => {
      stubCigaretteLicenseClient.preparePayment.mockRejectedValue(mockErrorPostResponse);
      const response = await request(app).post("/cigarette-license/prepare-payment").send({
        userData: userData,
        returnUrl: "some-url",
      });

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
    });
  });

  describe("/get-order-by-token", () => {
    let signedInUser: UserData;

    beforeEach(() => {
      signedInUser = generateUserData({
        currentBusinessId: "123",
        user: generateUser({
          id: "fake-id",
          name: "user-name1",
        }),
        businesses: {
          123: generateBusiness({
            profileData: {
              ...generateBusiness({}).profileData,
              hashedTaxId: "test-hashed-tax-id",
            },
            cigaretteLicenseData: generateCigaretteLicenseData({
              paymentInfo: {
                token: "some-token",
              },
            }),
          }),
        },
      });
      stubDynamoDataClient.get.mockResolvedValue(signedInUser);
    });

    it("gets signed in user and returns updated userData with order details for token", async () => {
      stubCigaretteLicenseClient.getOrderByToken.mockResolvedValue(mockSuccessGetResponse);

      const response = await request(app).get("/cigarette-license/get-order-by-token");

      expect(stubCigaretteLicenseClient.getOrderByToken).toHaveBeenCalled();
      expect(response.status).toEqual(StatusCodes.OK);

      const mockOrder = {
        orderId: 1234,
        orderStatus: "COMPLETE",
        timestamp: "now",
      };

      const expectedModifiedUserData = modifyCurrentBusiness(signedInUser, (business) => ({
        ...business,
        cigaretteLicenseData: {
          ...business.cigaretteLicenseData,
          paymentInfo: {
            ...business.cigaretteLicenseData?.paymentInfo,
            orderId: mockOrder.orderId,
            orderStatus: mockOrder.orderStatus,
            orderTimestamp: mockOrder.timestamp,
          },
        },
      }));

      expect(response.body).toEqual(expectedModifiedUserData);
    });

    it("returns bad request if cigaretteLicense token doesn't exist on the current business", async () => {
      stubCigaretteLicenseClient.getOrderByToken.mockResolvedValue(mockSuccessGetResponse);

      const userWithoutToken = generateUserData({
        currentBusinessId: "123",
        user: generateUser({
          id: "fake-id",
        }),
        businesses: {
          123: generateBusiness({
            cigaretteLicenseData: generateCigaretteLicenseData({}),
          }),
        },
      });

      stubDynamoDataClient.get.mockResolvedValue(userWithoutToken);
      const response = await request(app).get("/cigarette-license/get-order-by-token");

      expect(stubCigaretteLicenseClient.getOrderByToken).not.toHaveBeenCalled();
      expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    });

    it("updates user data with order details for token", async () => {
      stubCigaretteLicenseClient.getOrderByToken.mockResolvedValue(mockSuccessGetResponse);

      const response = await request(app).get("/cigarette-license/get-order-by-token");

      expect(stubCigaretteLicenseClient.getOrderByToken).toHaveBeenCalled();
      expect(response.status).toEqual(StatusCodes.OK);

      const mockOrder = {
        orderId: 1234,
        orderStatus: "COMPLETE",
        timestamp: "now",
      };

      const expectedModifiedUserData = modifyCurrentBusiness(signedInUser, (business) => ({
        ...business,
        cigaretteLicenseData: {
          ...business.cigaretteLicenseData,
          paymentInfo: {
            ...business.cigaretteLicenseData?.paymentInfo,
            orderId: mockOrder.orderId,
            orderStatus: mockOrder.orderStatus,
            orderTimestamp: mockOrder.timestamp,
          },
        },
      }));

      expect(stubDynamoDataClient.put).toHaveBeenCalledWith(expectedModifiedUserData);
    });

    it("returns previous userData if no matching orders are found", async () => {
      stubCigaretteLicenseClient.getOrderByToken.mockResolvedValue(mockErrorGetResponse);

      const response = await request(app).get("/cigarette-license/get-order-by-token");

      expect(response.status).toEqual(StatusCodes.OK);
      expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
      expect(response.body).toEqual(signedInUser);
    });

    it("returns 500 reponse if unknown error occurs", async () => {
      stubCigaretteLicenseClient.getOrderByToken.mockRejectedValue(mockErrorGetResponse);

      const response = await request(app).get("/cigarette-license/get-order-by-token");

      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
    });
  });

  describe("sendEmailConfirmation helper function", () => {
    let userData: UserData;

    beforeEach(() => {
      userData = generateUserData({});
    });

    it("sends posted user data email-confirmation and returns updated user data with email confirmation", async () => {
      stubCigaretteLicenseClient.sendEmailConfirmation.mockResolvedValue(mockSuccessEmailResponse);
      const updatedUserData = await sendEmailConfirmation(
        userData,
        "test-decrypted-tax-id",
        stubCigaretteLicenseClient,
        DummyLogWriter,
      );

      const expectedModifiedUserData = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        cigaretteLicenseData: {
          ...business.cigaretteLicenseData,
          paymentInfo: {
            ...business.cigaretteLicenseData?.paymentInfo,
            confirmationEmailsent: true,
          },
        },
      }));

      expect(updatedUserData).toEqual(expectedModifiedUserData);
    });

    it("returns existing userData if email-confirmation fails", async () => {
      stubCigaretteLicenseClient.sendEmailConfirmation.mockResolvedValue(mockErrorEmailResponse);
      const updatedUserData = await sendEmailConfirmation(
        userData,
        "test-decrypted-tax-id",
        stubCigaretteLicenseClient,
        DummyLogWriter,
      );

      expect(updatedUserData).toEqual(userData);
    });
  });
});
