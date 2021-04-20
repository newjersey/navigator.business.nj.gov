import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { MunicipalityClient } from "../domain/types";
import { generateMunicipalityDetail } from "../domain/factories";
import { municipalityRouterFactory } from "./municipalityRouter";

describe("municipalityRouter", () => {
  let app: Express;

  let stubMunicipalityClient: jest.Mocked<MunicipalityClient>;

  beforeEach(async () => {
    stubMunicipalityClient = {
      findOne: jest.fn(),
      findAll: jest.fn(),
    };
    app = express();
    app.use(bodyParser.json());
    app.use(municipalityRouterFactory(stubMunicipalityClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("gets municipalities with id", async () => {
    const municipality = generateMunicipalityDetail({});
    stubMunicipalityClient.findOne.mockResolvedValue(municipality);
    const response = await request(app).get(`/municipalities/123`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(municipality);
  });

  it("returns a 500 when municipality find fails", async () => {
    stubMunicipalityClient.findOne.mockRejectedValue("error");
    const response = await request(app).get(`/municipalities/failure`);
    expect(response.status).toEqual(500);
    expect(response.body).toEqual({ error: "error" });
  });

  it("gets all municipalities", async () => {
    const municipalities = [generateMunicipalityDetail({}), generateMunicipalityDetail({})];
    stubMunicipalityClient.findAll.mockResolvedValue(municipalities);
    const response = await request(app).get(`/municipalities`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(municipalities);
  });

  it("returns a 500 when municipality find fails", async () => {
    stubMunicipalityClient.findAll.mockRejectedValue("error");
    const response = await request(app).get(`/municipalities`);
    expect(response.status).toEqual(500);
    expect(response.body).toEqual({ error: "error" });
  });
});
