import { environmentPermitEmailRouter } from "@api/environmentPermitEmailRouter";
import { EmailMetaData, EnvironmentPermitEmailClient } from "@businessnjgovnavigator/shared";
import { setupExpress } from "@libs/express";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("environmentPermitEmailRouter", () => {
  let app: Express;
  let logger: LogWriterType;
  let stubEnvironmentPermitEmailClient: jest.Mocked<EnvironmentPermitEmailClient>;

  beforeEach(() => {
    jest.resetAllMocks();
    logger = DummyLogWriter;
    stubEnvironmentPermitEmailClient = {
      sendEmail: jest.fn(),
    };

    app = setupExpress(false);
    app.use(environmentPermitEmailRouter(stubEnvironmentPermitEmailClient, logger));
  });

  const emailMetaData: EmailMetaData = {
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
    const mockResponse = "Email sent successfully";
    stubEnvironmentPermitEmailClient.sendEmail.mockResolvedValue(mockResponse);

    const response = await request(app).post("/environment-permit-email").send({ emailMetaData });

    expect(stubEnvironmentPermitEmailClient.sendEmail).toHaveBeenCalledWith(emailMetaData);
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body).toEqual("SUCCESS");
  });

  it("handles error if request fails", async () => {
    const errorMessage = "Failed to send email";
    stubEnvironmentPermitEmailClient.sendEmail.mockRejectedValue(new Error(errorMessage));

    const response = await request(app).post("/environment-permit-email").send({ emailMetaData });

    expect(stubEnvironmentPermitEmailClient.sendEmail).toHaveBeenCalledWith(emailMetaData);
    expect(response.status).not.toEqual(StatusCodes.OK);
    expect(response.body).toEqual("FAILED");
  });
});
