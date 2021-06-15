import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { userRouterFactory } from "./userRouter";
import { generateUser, generateUserData } from "../domain/factories";
import jwt from "jsonwebtoken";
import { UserHandler } from "../domain/types";

jest.mock("jsonwebtoken", () => ({
  decode: jest.fn(),
}));
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe("userRouter", () => {
  let app: Express;

  let stubUserHandler: jest.Mocked<UserHandler>;

  beforeEach(async () => {
    stubUserHandler = {
      get: jest.fn(),
      put: jest.fn(),
      update: jest.fn(),
    };
    app = express();
    app.use(bodyParser.json());
    app.use(userRouterFactory(stubUserHandler));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  describe("GET", () => {
    it("gets user with id", async () => {
      const userData = generateUserData({});
      stubUserHandler.get.mockResolvedValue(userData);
      mockJwt.decode.mockReturnValue({ sub: "123" });
      const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(userData);
    });

    it("returns a 403 when user JWT does not match user ID", async () => {
      mockJwt.decode.mockReturnValue({ sub: "other-user-id" });
      const response = await request(app).get(`/users/123`).set("Authorization", "Bearer other-user-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("other-user-token");
      expect(stubUserHandler.get).not.toHaveBeenCalled();
      expect(response.status).toEqual(403);
    });

    it("returns a 500 when user get fails", async () => {
      stubUserHandler.get.mockRejectedValue("error");

      mockJwt.decode.mockReturnValue({ sub: "123" });
      const response = await request(app).get(`/users/123`).set("Authorization", "Bearer user-123-token");

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: "error" });
    });
  });

  describe("POST", () => {
    it("puts user data", async () => {
      mockJwt.decode.mockReturnValue({ sub: "123" });
      const userData = generateUserData({ user: generateUser({ id: "123" }) });
      stubUserHandler.put.mockResolvedValue(userData);

      const response = await request(app)
        .post(`/users`)
        .send(userData)
        .set("Authorization", "Bearer user-123-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("user-123-token");
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(userData);
    });

    it("returns a 403 when user JWT does not match user ID", async () => {
      mockJwt.decode.mockReturnValue({ sub: "other-user-id" });
      const userData = generateUserData({ user: generateUser({ id: "123" }) });

      const response = await request(app)
        .post(`/users`)
        .send(userData)
        .set("Authorization", "Bearer other-user-token");

      expect(mockJwt.decode).toHaveBeenCalledWith("other-user-token");
      expect(stubUserHandler.put).not.toHaveBeenCalled();
      expect(response.status).toEqual(403);
    });

    it("returns a 500 when user put fails", async () => {
      mockJwt.decode.mockReturnValue({ sub: "123" });
      const userData = generateUserData({ user: generateUser({ id: "123" }) });

      stubUserHandler.put.mockRejectedValue("error");
      const response = await request(app)
        .post(`/users`)
        .send(userData)
        .set("Authorization", "Bearer user-123-token");

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({ error: "error" });
    });
  });
});
