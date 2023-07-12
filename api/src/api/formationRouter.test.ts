/* eslint-disable @typescript-eslint/no-unused-vars */

import { Business } from "@shared/business";
import { getCurrentBusiness, modifyCurrentBusiness } from "@shared/businessHelpers";
import { formationTaskId } from "@shared/domain-logic/taskIds";
import {
  generateFormationData,
  generateFormationSubmitResponse,
  generateGetFilingResponse,
  generateProfileData,
  generateUserData,
  generateUserDataPrime,
} from "@shared/test";
import { Express } from "express";
import request from "supertest";
import { generateInputFile } from "../../test/factories";
import { saveFileFromUrl } from "../domain/s3Writer";
import { FormationClient, UserDataClient } from "../domain/types";
import { setupExpress } from "../libs/express";
import { formationRouterFactory } from "./formationRouter";
import { getSignedInUser, getSignedInUserId } from "./userRouter";

jest.mock("./userRouter", () => {
  return {
    getSignedInUserId: jest.fn(),
    getSignedInUser: jest.fn(),
  };
});

jest.mock("../domain/s3Writer.ts", () => {
  return {
    saveFileFromUrl: jest.fn(),
  };
});

const fakeSaveFileFromUrl = saveFileFromUrl as jest.Mock;
const fakeSignedInUserId = getSignedInUserId as jest.Mock;
const fakeSignedInUser = getSignedInUser as jest.Mock;

describe("formationRouter", () => {
  let app: Express;
  let stubFormationClient: jest.Mocked<FormationClient>;
  let stubUserDataClient: jest.Mocked<UserDataClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("some-id");
    fakeSignedInUser.mockReturnValue({
      sub: "1234",
      "custom:myNJUserKey": "1234myNJUserKey",
      "custom:identityId": "us-east-1:identityId",
      email: "whatever@gmail.com",
      identities: undefined,
    });
    stubFormationClient = {
      form: jest.fn(),
      getCompletedFiling: jest.fn(),
    };
    stubUserDataClient = {
      get: jest.fn(),
      findByEmail: jest.fn(),
      put: jest.fn(),
      getNeedNewsletterUsers: jest.fn(),
      getNeedToAddToUserTestingUsers: jest.fn(),
      getNeedTaxIdEncryptionUsers: jest.fn(),
    };
    app = setupExpress(false);
    app.use(formationRouterFactory(stubFormationClient, stubUserDataClient, { shouldSaveDocuments: true }));
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  describe("/formation", () => {
    it("sends posted user data to formation client and returns updated user data with client response", async () => {
      const formationResponse = generateFormationSubmitResponse({ success: true });
      stubFormationClient.form.mockResolvedValue(formationResponse);

      const userData = generateUserData({});
      const foreignGoodStandingFile = generateInputFile({});
      const response = await request(app).post(`/formation`).send({
        userData: userData,
        returnUrl: "some-url",
        foreignGoodStandingFile,
      });

      expect(stubFormationClient.form).toHaveBeenCalledWith(userData, "some-url", foreignGoodStandingFile);

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        ...userData,
        formationData: {
          ...userData.formationData,
          formationResponse: formationResponse,
        },
      });
    });

    it("updates user data with response from formation", async () => {
      const formationResponse = generateFormationSubmitResponse({ success: true });

      stubFormationClient.form.mockResolvedValue(formationResponse);

      const userData = generateUserData({});
      await request(app).post(`/formation`).send({
        userData: userData,
        returnUrl: "some-url",
      });

      expect(stubUserDataClient.put).toHaveBeenCalledWith({
        ...userData,
        formationData: {
          ...userData.formationData,
          formationResponse: formationResponse,
        },
      });
    });

    it("updates user data even if client fails", async () => {
      stubFormationClient.form.mockRejectedValue({});

      const userData = generateUserData({});
      await request(app).post(`/formation`).send({
        userData: userData,
        returnUrl: "some-url",
      });

      expect(stubUserDataClient.put).toHaveBeenCalledWith(userData);
    });
  });

  describe("/completed-filing", () => {
    let dateNowSpy: jest.SpyInstance;

    beforeEach(() => {
      dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => {
        return 1_487_076_708_000;
      });
      fakeSaveFileFromUrl.mockReset();
      fakeSaveFileFromUrl.mockImplementation((link, location, bucket) => {
        return Promise.resolve(`http://${location}`);
      });
    });

    afterAll(() => {
      dateNowSpy.mockRestore();
    });

    it("saves and returns updated user data with get-filing response", async () => {
      const getFilingResponse = generateGetFilingResponse({ success: true });
      stubFormationClient.getCompletedFiling.mockResolvedValue(getFilingResponse);

      const userData = generateUserDataPrime({
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ formationId: "some-formation-id" }),
        }),
        profileData: generateProfileData({
          documents: {
            certifiedDoc: "",
            formationDoc: "",
            standingDoc: "",
          },
        }),
      });
      stubUserDataClient.get.mockResolvedValue(userData);
      const response = await request(app).get(`/completed-filing`).send();

      expect(response.status).toEqual(200);
      const currentBusiness = getCurrentBusiness(userData);
      const expectedNewBusinessData: Business = {
        ...currentBusiness,
        formationData: {
          ...currentBusiness.formationData,
          getFilingResponse: getFilingResponse,
        },
        taskProgress: {
          ...currentBusiness.taskProgress,
          [formationTaskId]: "COMPLETED",
        },
        profileData: {
          ...currentBusiness.profileData,
          entityId: getFilingResponse.entityId,
          dateOfFormation: currentBusiness.formationData.formationFormData.businessStartDate,
          businessName: currentBusiness.formationData.formationFormData.businessName,
          documents: {
            ...currentBusiness.profileData.documents,
            formationDoc: `http://us-east-1:identityId/formationDoc-1487076708000.pdf`,
            certifiedDoc: `http://us-east-1:identityId/certifiedDoc-1487076708000.pdf`,
            standingDoc: `http://us-east-1:identityId/standingDoc-1487076708000.pdf`,
          },
        },
      };

      const expectedNewUserData = modifyCurrentBusiness(userData, expectedNewBusinessData);
      expect(fakeSaveFileFromUrl).toHaveBeenCalledWith(
        getFilingResponse.formationDoc,
        `us-east-1:identityId/formationDoc-1487076708000.pdf`,
        undefined
      );
      expect(response.body).toEqual(expectedNewUserData);
      expect(stubUserDataClient.put).toHaveBeenCalledWith(expectedNewUserData);
      expect(stubFormationClient.getCompletedFiling).toHaveBeenCalledWith("some-formation-id");
    });

    it("updates userData, without taskProgress complete nor entityID if getFiling is not success", async () => {
      const getFilingResponse = generateGetFilingResponse({ success: false });
      stubFormationClient.getCompletedFiling.mockResolvedValue(getFilingResponse);

      const userData = generateUserDataPrime({
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ formationId: "some-formation-id" }),
        }),
        profileData: generateProfileData({
          documents: {
            certifiedDoc: "",
            formationDoc: "",
            standingDoc: "",
          },
        }),
      });
      stubUserDataClient.get.mockResolvedValue(userData);
      await request(app).get(`/completed-filing`).send();

      const currentBusiness = getCurrentBusiness(userData);
      const expectedBusiness: Business = {
        ...currentBusiness,
        formationData: {
          ...currentBusiness.formationData,
          getFilingResponse: getFilingResponse,
        },
      };
      const expectedUserData = modifyCurrentBusiness(userData, expectedBusiness);

      expect(stubUserDataClient.put).toHaveBeenCalledWith(expectedUserData);
    });

    it("only fetches files that are in the filingResponse", async () => {
      const getFilingResponse = generateGetFilingResponse({ success: true, certifiedDoc: "" });
      stubFormationClient.getCompletedFiling.mockResolvedValue(getFilingResponse);

      const userData = generateUserDataPrime({
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ formationId: "some-formation-id" }),
        }),
        profileData: generateProfileData({
          documents: {
            certifiedDoc: "",
            formationDoc: "",
            standingDoc: "",
          },
        }),
      });
      stubUserDataClient.get.mockResolvedValue(userData);
      await request(app).get(`/completed-filing`).send();

      const currentBusiness = getCurrentBusiness(userData);
      const expectedNewBusinessData: Business = {
        ...currentBusiness,
        formationData: {
          ...currentBusiness.formationData,
          getFilingResponse: getFilingResponse,
        },
        taskProgress: {
          ...currentBusiness.taskProgress,
          [formationTaskId]: "COMPLETED",
        },
        profileData: {
          ...currentBusiness.profileData,
          entityId: getFilingResponse.entityId,
          dateOfFormation: currentBusiness.formationData.formationFormData.businessStartDate,
          businessName: currentBusiness.formationData.formationFormData.businessName,
          documents: {
            ...currentBusiness.profileData.documents,
            formationDoc: `http://us-east-1:identityId/formationDoc-1487076708000.pdf`,
            standingDoc: `http://us-east-1:identityId/standingDoc-1487076708000.pdf`,
          },
        },
      };

      const expectedNewUserData = modifyCurrentBusiness(userData, expectedNewBusinessData);

      expect(fakeSaveFileFromUrl).toHaveBeenCalledWith(
        getFilingResponse.formationDoc,
        `us-east-1:identityId/formationDoc-1487076708000.pdf`,
        process.env.DOCUMENT_S3_BUCKET
      );
      expect(fakeSaveFileFromUrl).toHaveBeenCalledWith(
        getFilingResponse.standingDoc,
        `us-east-1:identityId/standingDoc-1487076708000.pdf`,
        process.env.DOCUMENT_S3_BUCKET
      );
      expect(fakeSaveFileFromUrl).not.toHaveBeenCalledWith(
        getFilingResponse.certifiedDoc,
        `us-east-1:identityId/certifiedDoc-1487076708000.pdf`,
        process.env.DOCUMENT_S3_BUCKET
      );
      expect(stubUserDataClient.put).toHaveBeenCalledWith(expectedNewUserData);
    });
  });
});
