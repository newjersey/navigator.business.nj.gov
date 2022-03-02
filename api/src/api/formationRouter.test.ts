/* eslint-disable @typescript-eslint/no-unused-vars */

import bodyParser from "body-parser";
import express, { Express } from "express";
import request from "supertest";
import {
  generateFormationData,
  generateFormationFormData,
  generateFormationSubmitResponse,
  generateGetFilingResponse,
  generateProfileData,
  generateUserData,
} from "../../test/factories";
import { FormationClient, UserDataClient } from "../domain/types";
import { formationRouterFactory } from "./formationRouter";
import { getSignedInUserId } from "./userRouter";

jest.mock("./userRouter", () => ({
  getSignedInUserId: jest.fn(),
}));
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("formationRouter", () => {
  let app: Express;
  let stubFormationClient: jest.Mocked<FormationClient>;
  let stubUserDataClient: jest.Mocked<UserDataClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("some-id");
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
    it("saves and returns updated user data with get-filing response", async () => {
      const getFilingResponse = generateGetFilingResponse({ success: true });
      stubFormationClient.getCompletedFiling.mockResolvedValue(getFilingResponse);

      const userData = generateUserData({
        profileData: generateProfileData({
          businessName: "Old Name",
        }),
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ formationId: "some-formation-id" }),
          formationFormData: generateFormationFormData({
            businessName: "New Name",
          }),
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
          businessName: "New Name",
        },
      };

      expect(response.body).toEqual(expectedNewUserData);
      expect(stubUserDataClient.put).toHaveBeenCalledWith(expectedNewUserData);
      expect(stubFormationClient.getCompletedFiling).toHaveBeenCalledWith("some-formation-id");
    });

    it("updates userData, without taskProgress complete, entityID and businessName, if getFiling is not success", async () => {
      const getFilingResponse = generateGetFilingResponse({ success: false });
      stubFormationClient.getCompletedFiling.mockResolvedValue(getFilingResponse);

      const userData = generateUserData({
        profileData: generateProfileData({
          businessName: "Old Name",
        }),
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ formationId: "some-formation-id" }),
          formationFormData: generateFormationFormData({
            businessName: "New Name",
          }),
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
  });
});
