import { authRouterFactory } from "@api/authRouter";
import { CognitoUserClient, DatabaseClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { DummyLogWriter } from "@libs/logWriter";
import { generateUser, generateUserData } from "@shared/test";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("authRouter", () => {
  let app: Express;
  let stubDatabaseClient: jest.Mocked<DatabaseClient>;
  let stubCognitoUserClient: jest.Mocked<CognitoUserClient>;

  beforeEach(async () => {
    stubDatabaseClient = {
      migrateOutdatedVersionUsers: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      findAllByEmail: jest.fn(),
      findUserByBusinessName: jest.fn(),
      findUsersByBusinessNamePrefix: jest.fn(),
      findBusinessesByHashedTaxId: jest.fn(),
    };
    stubCognitoUserClient = { findUsername: jest.fn(), ensureSignInEnabled: jest.fn() };
    app = setupExpress(false);
    app.use("/api", authRouterFactory(stubDatabaseClient, stubCognitoUserClient, DummyLogWriter));
  });

  it("returns 400 when email is missing", async () => {
    const response = await request(app).post("/api/auth/resolve").send({});
    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(stubDatabaseClient.findAllByEmail).not.toHaveBeenCalled();
  });

  it("returns 400 when email is not a string", async () => {
    const response = await request(app).post("/api/auth/resolve").send({ email: 42 });
    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(stubDatabaseClient.findAllByEmail).not.toHaveBeenCalled();
  });

  it("returns 404 when no account holds the email", async () => {
    stubDatabaseClient.findAllByEmail.mockResolvedValue([]);

    const response = await request(app)
      .post("/api/auth/resolve")
      .send({ email: "nobody@example.com" });

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(stubCognitoUserClient.findUsername).not.toHaveBeenCalled();
  });

  it("normalizes the email before lookup", async () => {
    stubDatabaseClient.findAllByEmail.mockResolvedValue([]);

    await request(app).post("/api/auth/resolve").send({ email: "  MixedCase@Example.COM " });

    expect(stubDatabaseClient.findAllByEmail).toHaveBeenCalledWith("mixedcase@example.com");
  });

  it("returns the prefixed username for a legacy account and enables sign-in", async () => {
    const userData = generateUserData({
      user: generateUser({ id: "legacy-id", email: "a@example.com" }),
    });
    stubDatabaseClient.findAllByEmail.mockResolvedValue([userData]);
    stubCognitoUserClient.findUsername.mockResolvedValue("myNJ_legacy-id");

    const response = await request(app).post("/api/auth/resolve").send({ email: "a@example.com" });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({ username: "myNJ_legacy-id" });
    expect(stubCognitoUserClient.findUsername).toHaveBeenCalledWith([
      "myNJ_legacy-id",
      "legacy-id",
    ]);
    expect(stubCognitoUserClient.ensureSignInEnabled).toHaveBeenCalledWith("myNJ_legacy-id");
  });

  it("returns 409 MULTIPLE_ACCOUNTS when several share the email", async () => {
    const email = "shared@example.com";
    const older = generateUserData({
      user: generateUser({ id: "aaa", email }),
      lastUpdatedISO: "2020-01-01T00:00:00.000Z",
    });
    const newer = generateUserData({
      user: generateUser({ id: "bbb", email }),
      lastUpdatedISO: "2026-01-01T00:00:00.000Z",
    });
    stubDatabaseClient.findAllByEmail.mockResolvedValue([older, newer]);

    const response = await request(app).post("/api/auth/resolve").send({ email });

    expect(response.status).toBe(StatusCodes.CONFLICT);
    expect(response.body).toEqual({ error: "MULTIPLE_ACCOUNTS" });
    expect(stubCognitoUserClient.findUsername).not.toHaveBeenCalled();
    expect(stubCognitoUserClient.ensureSignInEnabled).not.toHaveBeenCalled();
  });

  // Also proves the consolidated filter runs BEFORE the multi-account count gate:
  // two rows, one consolidated, is a single-candidate case and must still resolve.
  it("ignores a consolidated account", async () => {
    const email = "shared@example.com";
    const consolidated = {
      ...generateUserData({
        user: generateUser({ id: "aaa", email }),
        lastUpdatedISO: "2026-06-01T00:00:00.000Z",
      }),
      consolidatedInto: {
        userId: "bbb",
        businessIds: [],
        documentsCopied: [],
        mergedAtISO: "2026-06-01T00:00:00.000Z",
      },
    };
    const live = generateUserData({
      user: generateUser({ id: "bbb", email }),
      lastUpdatedISO: "2020-01-01T00:00:00.000Z",
    });
    stubDatabaseClient.findAllByEmail.mockResolvedValue([consolidated, live]);
    stubCognitoUserClient.findUsername.mockResolvedValue("myNJ_bbb");

    const response = await request(app).post("/api/auth/resolve").send({ email });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.body).toEqual({ username: "myNJ_bbb" });
  });

  it("returns 404 when the only account is consolidated", async () => {
    const consolidated = {
      ...generateUserData({ user: generateUser({ id: "aaa", email: "a@example.com" }) }),
      consolidatedInto: {
        userId: "bbb",
        businessIds: [],
        documentsCopied: [],
        mergedAtISO: "2026-06-01T00:00:00.000Z",
      },
    };
    stubDatabaseClient.findAllByEmail.mockResolvedValue([consolidated]);

    const response = await request(app).post("/api/auth/resolve").send({ email: "a@example.com" });

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(stubCognitoUserClient.findUsername).not.toHaveBeenCalled();
  });

  it("returns 404 when the record exists but Cognito does not have the user", async () => {
    const userData = generateUserData({
      user: generateUser({ id: "orphan", email: "a@example.com" }),
    });
    stubDatabaseClient.findAllByEmail.mockResolvedValue([userData]);
    // eslint-disable-next-line unicorn/no-useless-undefined
    stubCognitoUserClient.findUsername.mockResolvedValue(undefined);

    const response = await request(app).post("/api/auth/resolve").send({ email: "a@example.com" });

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(stubCognitoUserClient.ensureSignInEnabled).not.toHaveBeenCalled();
  });

  it("returns 500 when the lookup throws", async () => {
    stubDatabaseClient.findAllByEmail.mockRejectedValue(new Error("boom"));

    const response = await request(app).post("/api/auth/resolve").send({ email: "a@example.com" });

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it("returns 500 when enabling sign-in throws", async () => {
    const userData = generateUserData({
      user: generateUser({ id: "legacy-id", email: "a@example.com" }),
    });
    stubDatabaseClient.findAllByEmail.mockResolvedValue([userData]);
    stubCognitoUserClient.findUsername.mockResolvedValue("myNJ_legacy-id");
    stubCognitoUserClient.ensureSignInEnabled.mockRejectedValue(new Error("throttled"));

    const response = await request(app).post("/api/auth/resolve").send({ email: "a@example.com" });

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });
});
