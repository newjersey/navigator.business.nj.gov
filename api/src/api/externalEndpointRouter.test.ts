import { externalEndpointRouterFactory } from "@api/externalEndpointRouter";
import { AddNewsletter, NewsletterClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { DummyLogWriter } from "@libs/logWriter";
import { generateUser, generateUserData } from "@shared/test";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

const encodeTokenSegment = (value: object): string => {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
};

const createUnsignedToken = (claims: Record<string, unknown>): string => {
  return `${encodeTokenSegment({ alg: "none", typ: "JWT" })}.${encodeTokenSegment(claims)}.`;
};

describe("externalEndpointRouter", () => {
  let app: Express;
  let stubAddNewsletter: jest.MockedFunction<AddNewsletter>;
  let stubNewsletterClient: jest.Mocked<NewsletterClient>;

  beforeEach(async () => {
    stubAddNewsletter = jest.fn();
    stubNewsletterClient = {
      add: jest.fn(),
    };
    app = setupExpress(false);
    app.use(externalEndpointRouterFactory(stubAddNewsletter, stubNewsletterClient, DummyLogWriter));
    jest.spyOn(DummyLogWriter, "LogInfo").mockImplementation(() => {});
    jest.spyOn(DummyLogWriter, "LogError").mockImplementation(() => {});
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  describe("POST", () => {
    describe("newsletter", () => {
      it("adds to newsletter if receiveNewsletter is set to true and externalStatus is empty", async () => {
        const userData = generateUserData({
          user: generateUser({
            externalStatus: { userTesting: { status: "IN_PROGRESS" } },
            receiveNewsletter: true,
          }),
        });
        await request(app).post(`/newsletter`).send(userData);
        expect(stubAddNewsletter).toHaveBeenCalled();
        expect(DummyLogWriter.LogInfo).toHaveBeenCalledWith(
          expect.stringContaining("successfully updated newsletter preferences for userId:"),
        );
      });

      it("does not add to newsletter if the request has been attempted", async () => {
        const userData = generateUserData({
          user: generateUser({
            externalStatus: { newsletter: { status: "IN_PROGRESS" } },
            receiveNewsletter: true,
          }),
        });
        await request(app).post(`/newsletter`).send(userData);
        expect(stubAddNewsletter).not.toHaveBeenCalled();
      });

      it("returns the newsletter result to an anonymous caller", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123", externalStatus: {}, receiveNewsletter: true }),
        });
        const newsletterResult = generateUserData({
          user: generateUser({
            id: "123",
            externalStatus: { newsletter: { status: "SUCCESS" } },
            receiveNewsletter: true,
          }),
        });
        stubAddNewsletter.mockResolvedValue(newsletterResult);

        const response = await request(app).post(`/newsletter`).send(userData);

        expect(stubAddNewsletter).toHaveBeenCalledWith(userData);
        expect(response.status).toEqual(StatusCodes.OK);
        expect(response.body).toEqual(newsletterResult);
      });

      it("responds the same way when the request carries a token claiming the user's identity", async () => {
        const userData = generateUserData({
          user: generateUser({ id: "123", externalStatus: {}, receiveNewsletter: true }),
        });
        const newsletterResult = generateUserData({
          user: generateUser({
            id: "123",
            externalStatus: { newsletter: { status: "SUCCESS" } },
            receiveNewsletter: true,
          }),
        });
        stubAddNewsletter.mockResolvedValue(newsletterResult);

        const response = await request(app)
          .post(`/newsletter`)
          .send(userData)
          .set("Authorization", `Bearer ${createUnsignedToken({ sub: "123" })}`);

        expect(response.status).toEqual(StatusCodes.OK);
        expect(response.body).toEqual(newsletterResult);
      });

      it("logs no update needed and does not call addNewsletter when no update is needed", async () => {
        const userData = generateUserData({
          user: generateUser({
            externalStatus: { newsletter: { status: "IN_PROGRESS" } },
            receiveNewsletter: true,
          }),
        });

        await request(app).post(`/newsletter`).send(userData);

        expect(stubAddNewsletter).not.toHaveBeenCalled();
        expect(DummyLogWriter.LogInfo).toHaveBeenCalledWith(
          expect.stringContaining("no update to newsletter preferences needed for userId"),
        );
      });
    });

    describe("newsletter/subscribe", () => {
      it("subscribes a valid email and returns the client's response", async () => {
        stubNewsletterClient.add.mockResolvedValue({ success: true, status: "SUCCESS" });

        const response = await request(app)
          .post("/newsletter/subscribe")
          .send({ email: "user@example.com" });

        expect(stubNewsletterClient.add).toHaveBeenCalledWith("user@example.com");
        expect(response.status).toEqual(StatusCodes.OK);
        expect(response.body).toEqual({ success: true, status: "SUCCESS" });
        expect(DummyLogWriter.LogInfo).toHaveBeenCalledWith(
          expect.stringContaining("newsletter subscribe result: SUCCESS"),
        );
      });

      it("passes through a failure response from the newsletter client", async () => {
        stubNewsletterClient.add.mockResolvedValue({ success: false, status: "EMAIL_ERROR" });

        const response = await request(app)
          .post("/newsletter/subscribe")
          .send({ email: "user@example.com" });

        expect(response.status).toEqual(StatusCodes.OK);
        expect(response.body).toEqual({ success: false, status: "EMAIL_ERROR" });
        expect(DummyLogWriter.LogInfo).toHaveBeenCalledWith(
          expect.stringContaining("newsletter subscribe result: EMAIL_ERROR"),
        );
      });

      it("returns BAD_GATEWAY when the newsletter client cannot reach GovDelivery", async () => {
        stubNewsletterClient.add.mockResolvedValue({ success: false, status: "CONNECTION_ERROR" });

        const response = await request(app)
          .post("/newsletter/subscribe")
          .send({ email: "user@example.com" });

        expect(response.status).toEqual(StatusCodes.BAD_GATEWAY);
        expect(response.body).toEqual({ success: false, status: "CONNECTION_ERROR" });
        expect(DummyLogWriter.LogInfo).toHaveBeenCalledWith(
          expect.stringContaining("newsletter subscribe result: CONNECTION_ERROR"),
        );
      });

      it("rejects a malformed email without calling the newsletter client", async () => {
        const response = await request(app)
          .post("/newsletter/subscribe")
          .send({ email: "not-an-email" });

        expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
        expect(stubNewsletterClient.add).not.toHaveBeenCalled();
        expect(DummyLogWriter.LogInfo).toHaveBeenCalledWith(
          expect.stringContaining("rejected invalid email"),
        );
      });

      it("rejects a missing email without calling the newsletter client", async () => {
        const response = await request(app).post("/newsletter/subscribe").send({});

        expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
        expect(stubNewsletterClient.add).not.toHaveBeenCalled();
        expect(DummyLogWriter.LogInfo).toHaveBeenCalledWith(
          expect.stringContaining("rejected invalid email"),
        );
      });

      it("rejects a non-string email without calling the newsletter client", async () => {
        const response = await request(app).post("/newsletter/subscribe").send({ email: 12345 });

        expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
        expect(stubNewsletterClient.add).not.toHaveBeenCalled();
        expect(DummyLogWriter.LogInfo).toHaveBeenCalledWith(
          expect.stringContaining("rejected invalid email"),
        );
      });
    });
  });
});
