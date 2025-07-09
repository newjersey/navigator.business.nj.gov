/* eslint-disable @typescript-eslint/no-unused-vars */
import { decryptionRouterFactory } from "@api/decryptionRouter";
import { CryptoClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { DummyLogWriter } from "@libs/logWriter";
import { Express } from "express";
import request from "supertest";

describe("decryptionRouter", () => {
  let app: Express;
  let stubCryptoClient: jest.Mocked<CryptoClient>;

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

    app = setupExpress(false);
    app.use(decryptionRouterFactory(stubCryptoClient, DummyLogWriter));
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
  });
});
