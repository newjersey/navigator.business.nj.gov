/* eslint-disable @typescript-eslint/no-unused-vars */
import { Express } from "express";
import request from "supertest";
import { EncryptionDecryptionClient } from "../domain/types";
import { setupExpress } from "../libs/express";
import { taxDecryptionRouterFactory } from "./taxDecryptionRouter";

describe("taxDecryptionRouter", () => {
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
    app.use(taxDecryptionRouterFactory(stubEncryptionDecryptionClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  describe("/decrypt", () => {
    it("decrypts tax id", async () => {
      const response = await request(app).post(`/decrypt`).send({ encryptedTaxId: "sample-value" });
      expect(response.body).toEqual("decrypted sample-value");
    });
  });
});
