/* eslint-disable @typescript-eslint/no-unused-vars */

import bodyParser from "body-parser";
import express, { Express } from "express";
import request from "supertest";
import { generateUserData } from "../../test/factories";
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

  it("sends posted user data to formation client and returns updated user data with client response", async () => {
    const formationResponse = {
      success: true,
      token: "some-token",
      redirect: "some-redirect",
      errors: [],
    };
    stubFormationClient.form.mockResolvedValue(formationResponse);

    const userData = generateUserData({});
    const response = await request(app).post(`/formation`).send(userData);

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
    const formationResponse = {
      success: true,
      token: "some-token",
      redirect: "some-redirect",
      errors: [],
    };
    stubFormationClient.form.mockResolvedValue(formationResponse);

    const userData = generateUserData({});
    await request(app).post(`/formation`).send(userData);

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
    await request(app).post(`/formation`).send(userData);

    expect(stubUserDataClient.put).toHaveBeenCalledWith(userData);
  });
});
