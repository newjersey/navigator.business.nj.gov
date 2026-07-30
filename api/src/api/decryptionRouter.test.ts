/* eslint-disable @typescript-eslint/no-unused-vars */
import { decryptionRouterFactory } from "@api/decryptionRouter";
import { type CryptoClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { DummyLogWriter, type LogWriterType } from "@libs/logWriter";
import { type Express } from "express";
import request from "supertest";

describe("decryptionRouter", () => {
  let app: Express;
  let stubCryptoClient: jest.Mocked<CryptoClient>;
  let logger: LogWriterType;

  beforeEach(async () => {
    jest.resetAllMocks();

    stubCryptoClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn((value) => {
        return new Promise((resolve) => {
          resolve(`decrypted ${value}`);
        });
      }),
      hashValue: jest.fn(),
    };

    logger = {
      ...DummyLogWriter,
      LogError: jest.fn(),
    };
    app = setupExpress(false);
    app.use(decryptionRouterFactory(stubCryptoClient, logger));
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  describe("/decrypt", () => {
    it("decrypts value", async () => {
      const response = await request(app).post(`/decrypt`).send({ encryptedValue: "sample-value" });
      expect(response.body).toEqual("decrypted sample-value");
    });

    it.each([
      "unencryptedDataKey has not been set",
      "AccessDeniedException",
      "Invalid ciphertext",
      "ThrottlingException",
      "TimeoutError",
      "Encryption Context does not match expected values",
    ])("returns 500 when decryption fails with %s", async (message) => {
      stubCryptoClient.decryptValue.mockRejectedValueOnce(new Error(message));

      const response = await request(app).post("/decrypt").send({ encryptedValue: "ciphertext" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: message });
      expect(logger.LogError).toHaveBeenCalledWith(
        expect.stringContaining(`Failed to decrypt value: ${message}`),
      );
    });
  });
});
