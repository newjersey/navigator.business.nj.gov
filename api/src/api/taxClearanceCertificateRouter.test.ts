import { taxClearanceCertificateRouterFactory } from "@api/taxClearanceCertificateRouter";
import { TaxClearanceCertificateClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("taxClearanceCertificateRouterFactory", () => {
  let app: Express;
  let stubTaxClearanceCertificateClient: jest.Mocked<TaxClearanceCertificateClient>;

  beforeEach(() => {
    jest.resetAllMocks();
    stubTaxClearanceCertificateClient = {
      postTaxClearanceCertificate: jest.fn(),
    };
    app = setupExpress(false);
    app.use(taxClearanceCertificateRouterFactory(stubTaxClearanceCertificateClient));
  });

  it("returns a successful response", async () => {
    stubTaxClearanceCertificateClient.postTaxClearanceCertificate.mockResolvedValue({
      certificatePdfArray: [12],
    });
    const response = await request(app).post(`/postTaxClearanceCertificate`);
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body).toEqual({ certificatePdfArray: [12] });
  });

  it("throws a server error", async () => {
    stubTaxClearanceCertificateClient.postTaxClearanceCertificate.mockRejectedValue("some value");
    const response = await request(app).post(`/postTaxClearanceCertificate`);
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual("some value");
  });
});
