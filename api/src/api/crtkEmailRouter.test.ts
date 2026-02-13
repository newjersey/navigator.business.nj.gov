import { crtkEmailRouter } from "@api/crtkEmailRouter";
import { CrtkEmailMetadata } from "@businessnjgovnavigator/shared";
import { PowerAutomateEmailClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("crtkEmailRouter", () => {
  let app: Express;
  let logger: LogWriterType;
  let stubCrtkEmailClient: jest.Mocked<PowerAutomateEmailClient>;

  beforeEach(() => {
    jest.resetAllMocks();
    logger = DummyLogWriter;
    stubCrtkEmailClient = {
      sendEmail: jest.fn(),
      health: jest.fn(),
    };

    app = setupExpress(false);
    app.use(crtkEmailRouter(stubCrtkEmailClient, logger));
  });

  const emailMetaData: CrtkEmailMetadata = {
    username: "test user",
    email: "test@example.com",
    businessName: "Test Business",
    businessStatus: "Operating",
    businessAddress: "123 Main Street",
    industry: "Test Industry",
    ein: "123456789",
    naicsCode: "123456",
    businessActivities: "These are my business activities. We do a lot of things.",
    materialOrProducts: "These are my materials and products.",
  };

  it("sends a request with emailMetaData and returns a success response", async () => {
    stubCrtkEmailClient.sendEmail.mockResolvedValue({
      statusCode: StatusCodes.OK,
      message: "Email confirmation successfully sent",
    });

    const response = await request(app).post("/crtk-email").send({ emailMetaData });

    expect(stubCrtkEmailClient.sendEmail).toHaveBeenCalledWith(emailMetaData);
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body).toEqual("SUCCESS");
  });

  it("throws an error if status is not 200", async () => {
    stubCrtkEmailClient.sendEmail.mockResolvedValue({
      statusCode: StatusCodes.FORBIDDEN,
      message: "Auth Failed",
    });

    const response = await request(app).post("/crtk-email").send({ emailMetaData });

    expect(stubCrtkEmailClient.sendEmail).toHaveBeenCalledWith(emailMetaData);
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual("FAILED");
  });

  it("handles error if request fails", async () => {
    const errorMessage = "Failed to send email";
    stubCrtkEmailClient.sendEmail.mockRejectedValue(new Error(errorMessage));

    const response = await request(app).post("/crtk-email").send({ emailMetaData });

    expect(stubCrtkEmailClient.sendEmail).toHaveBeenCalledWith(emailMetaData);
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual("FAILED");
  });
});
