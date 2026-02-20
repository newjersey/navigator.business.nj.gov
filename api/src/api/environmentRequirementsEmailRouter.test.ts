import { environmentRequirementsEmailRouter } from "@api/environmentRequirementsEmailRouter";
import { EnvironmentRequirementsEmailMetaData } from "@businessnjgovnavigator/shared";
import { PowerAutomateEmailClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("environmentRequirementsEmailRouter", () => {
  let app: Express;
  let logger: LogWriterType;
  let stubEnvReqEmailClient: jest.Mocked<PowerAutomateEmailClient>;

  beforeEach(() => {
    jest.resetAllMocks();
    logger = DummyLogWriter;
    stubEnvReqEmailClient = {
      sendEmail: jest.fn(),
      health: jest.fn(),
    };

    app = setupExpress(false);
    app.use(environmentRequirementsEmailRouter(stubEnvReqEmailClient, logger));
  });

  const emailMetaData: EnvironmentRequirementsEmailMetaData = {
    email: "test@gmail.com",
    userName: "test-user",
    businessName: "Test Business",
    industry: "Test Industry",
    location: "Test Location",
    phase: "FORMED",
    naicsCode: "123456",
    questionnaireResponses: "<ul><li>Test Response</li></ul>",
  };

  it("sends a request with emailMetaData and returns a success response", async () => {
    stubEnvReqEmailClient.sendEmail.mockResolvedValue({
      statusCode: StatusCodes.OK,
      message: "Email confirmation successfully sent",
    });

    const response = await request(app)
      .post("/environment-requirements-email")
      .send({ emailMetaData });

    expect(stubEnvReqEmailClient.sendEmail).toHaveBeenCalledWith(emailMetaData);
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body).toEqual("SUCCESS");
  });

  it("throws an error if status is not 200", async () => {
    stubEnvReqEmailClient.sendEmail.mockResolvedValue({
      statusCode: StatusCodes.FORBIDDEN,
      message: "Auth Failed",
    });

    const response = await request(app)
      .post("/environment-requirements-email")
      .send({ emailMetaData });

    expect(stubEnvReqEmailClient.sendEmail).toHaveBeenCalledWith(emailMetaData);
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual("FAILED");
  });

  it("handles error if request fails", async () => {
    const errorMessage = "Failed to send email";
    stubEnvReqEmailClient.sendEmail.mockRejectedValue(new Error(errorMessage));

    const response = await request(app)
      .post("/environment-requirements-email")
      .send({ emailMetaData });

    expect(stubEnvReqEmailClient.sendEmail).toHaveBeenCalledWith(emailMetaData);
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual("FAILED");
  });
});
