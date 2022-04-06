/* eslint-disable @typescript-eslint/no-unused-vars */

import bodyParser from "body-parser";
import express, { Express } from "express";
import request from "supertest";
import {
  generateFormationData,
  generateFormationSubmitResponse,
  generateGetFilingResponse,
  generateUserData,
} from "../../test/factories";
import { saveFileFromUrl } from "../domain/s3Writer";
import { FormationClient, UserDataClient } from "../domain/types";
import { formationRouterFactory } from "./formationRouter";
import { getSignedInUser, getSignedInUserId } from "./userRouter";

jest.mock("./userRouter", () => ({
  getSignedInUserId: jest.fn(),
  getSignedInUser: jest.fn(),
}));

jest.mock("../domain/s3Writer.ts", () => ({
  saveFileFromUrl: jest.fn(),
}));

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
    };
    app = express();
    app.use(bodyParser.json());
    app.use(formationRouterFactory(stubFormationClient, stubUserDataClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  describe("/formation", () => {
    it("sends posted user data to formation client and returns updated user data with client response", async () => {
      const formationResponse = generateFormationSubmitResponse({ success: true });
      stubFormationClient.form.mockResolvedValue(formationResponse);

      const userData = generateUserData({});
      const response = await request(app).post(`/formation`).send({
        userData: userData,
        returnUrl: "some-url",
      });

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
      dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => 1487076708000);
      fakeSaveFileFromUrl.mockReset();
      fakeSaveFileFromUrl.mockImplementation((link, location, bucket) =>
        Promise.resolve(`http://${location}`)
      );
    });
    afterAll(() => {
      dateNowSpy.mockRestore();
    });

    it("saves and returns updated user data with get-filing response", async () => {
      const getFilingResponse = generateGetFilingResponse({ success: true });
      stubFormationClient.getCompletedFiling.mockResolvedValue(getFilingResponse);

      const userData = generateUserData({
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ formationId: "some-formation-id" }),
        }),
      });
      stubUserDataClient.get.mockResolvedValue(userData);
      const response = await request(app).get(`/completed-filing`).send();

      expect(response.status).toEqual(200);

      const expectedNewUserData = {
        ...userData,
        formationData: {
          ...userData.formationData,
          getFilingResponse: getFilingResponse,
        },
        taskProgress: {
          ...userData.taskProgress,
          "form-business-entity": "COMPLETED",
        },
        profileData: {
          ...userData.profileData,
          entityId: getFilingResponse.entityId,
          dateOfFormation: userData.formationData.formationFormData.businessStartDate,
          documents: {
            ...userData.profileData.documents,
            formationDoc: `http://us-east-1:identityId/formationDoc-1487076708000.pdf`,
            certifiedDoc: `http://us-east-1:identityId/certifiedDoc-1487076708000.pdf`,
            standingDoc: `http://us-east-1:identityId/standingDoc-1487076708000.pdf`,
          },
        },
      };
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

      const userData = generateUserData({
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ formationId: "some-formation-id" }),
        }),
      });
      stubUserDataClient.get.mockResolvedValue(userData);
      await request(app).get(`/completed-filing`).send();

      expect(stubUserDataClient.put).toHaveBeenCalledWith({
        ...userData,
        formationData: {
          ...userData.formationData,
          getFilingResponse: getFilingResponse,
        },
      });
    });

    it("only fetches files that are in the filingResponse", async () => {
      const getFilingResponse = generateGetFilingResponse({ success: true, certifiedDoc: "" });
      stubFormationClient.getCompletedFiling.mockResolvedValue(getFilingResponse);

      const userData = generateUserData({
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ formationId: "some-formation-id" }),
        }),
      });
      stubUserDataClient.get.mockResolvedValue(userData);
      await request(app).get(`/completed-filing`).send();

      const expectedNewUserData = {
        ...userData,
        formationData: {
          ...userData.formationData,
          getFilingResponse: getFilingResponse,
        },
        taskProgress: {
          ...userData.taskProgress,
          "form-business-entity": "COMPLETED",
        },
        profileData: {
          ...userData.profileData,
          entityId: getFilingResponse.entityId,
          dateOfFormation: userData.formationData.formationFormData.businessStartDate,
          documents: {
            ...userData.profileData.documents,
            formationDoc: `http://us-east-1:identityId/formationDoc-1487076708000.pdf`,
            standingDoc: `http://us-east-1:identityId/standingDoc-1487076708000.pdf`,
          },
        },
      };

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
