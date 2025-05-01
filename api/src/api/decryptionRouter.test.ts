/* eslint-disable @typescript-eslint/no-unused-vars */
import { decryptionRouterFactory } from "@api/decryptionRouter";
import { EncryptionDecryptionClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { Express } from "express";
import request from "supertest";

describe("decryptionRouter", () => {
  let app: Express;
  let stubEncryptionDecryptionClient: jest.Mocked<EncryptionDecryptionClient>;

  beforeEach(async () => {
    jest.resetAllMocks();

    stubEncryptionDecryptionClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn((value) => {
        return new Promise((resolve) => {
          resolve(`decrypted ${value}`);
        });
      }),
    };

    app = setupExpress(false);
    app.use(decryptionRouterFactory(stubEncryptionDecryptionClient));
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
