import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { routerFactory } from "./router";
import { UserDataClient } from "../domain/types";
import { generateUserData } from "../domain/factories";

describe("router", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;

  beforeEach(async () => {
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
    };
    app = express();
    app.use(bodyParser.json());
    app.use(routerFactory(stubUserDataClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("gets user with id", async () => {
    const userData = generateUserData({});
    stubUserDataClient.get.mockResolvedValue(userData);
    const response = await request(app).get(`/users/123`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(userData);
  });

  it("returns a 500 when user get fails", async () => {
    stubUserDataClient.get.mockRejectedValue("error");
    const response = await request(app).get(`/users/failure`);
    expect(response.status).toEqual(500);
    expect(response.body).toEqual({ error: "error" });
  });

  it("puts user data", async () => {
    const userData = generateUserData({});
    stubUserDataClient.put.mockResolvedValue(userData);

    const response = await request(app).post(`/users`).send(userData);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(userData);
  });

  it("returns a 500 when user put fails", async () => {
    stubUserDataClient.put.mockRejectedValue("error");
    const response = await request(app).post(`/users`).send(generateUserData({}));
    expect(response.status).toEqual(500);
    expect(response.body).toEqual({ error: "error" });
  });
});
