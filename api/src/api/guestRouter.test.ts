import { NameAvailability } from "@shared/businessNameSearch";
import { Express } from "express";
import request from "supertest";
import {
  generateProfileData,
  generateTaxFilingData,
  generateUser,
  generateUserData,
} from "../../test/factories";
import { determineAnnualFilingDate } from "../../test/helpers";
import { BusinessNameClient } from "../domain/types";
import { setupExpress } from "../libs/express";
import { guestRouterFactory } from "./guestRouter";

describe("guestRouter", () => {
  let app: Express;

  let stubBusinessNameClient: jest.Mocked<BusinessNameClient>;

  beforeEach(async () => {
    stubBusinessNameClient = { search: jest.fn() };
    app = setupExpress(false);
    app.use(guestRouterFactory(stubBusinessNameClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  describe("POST annualFilings", () => {
    it("calculates new annual filing date and updates it for dateOfFormation", async () => {
      const postedUserData = generateUserData({
        user: generateUser({ id: "123" }),
        profileData: generateProfileData({
          dateOfFormation: "2021-03-01",
          entityId: undefined,
          legalStructureId: "limited-liability-company",
        }),
        taxFilingData: generateTaxFilingData({
          filings: [],
        }),
      });

      const response = await request(app).post(`/annualFilings`).send(postedUserData);

      expect(response.body).toEqual({
        ...postedUserData,
        taxFilingData: {
          ...postedUserData.taxFilingData,
          filings: [{ identifier: "ANNUAL_FILING", dueDate: determineAnnualFilingDate("2021-03-01") }],
        },
      });
    });
  });

  describe("GET /business-name-availability", () => {
    it("returns the availability status", async () => {
      const result: NameAvailability = {
        status: "AVAILABLE",
        similarNames: [],
      };
      stubBusinessNameClient.search.mockResolvedValue(result);

      const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
      expect(response.status).toEqual(200);
      expect(response.body).toEqual(result);
      expect(stubBusinessNameClient.search).toHaveBeenCalledWith("apple bee's");
    });

    it("limits similar names returned to 10", async () => {
      const result: NameAvailability = {
        status: "UNAVAILABLE",
        similarNames: Array.from({ length: 20 }).fill("abc") as string[],
      };
      stubBusinessNameClient.search.mockResolvedValue(result);

      const response = await request(app).get(`/business-name-availability?query=abcd`);
      expect(response.status).toEqual(200);
      expect(response.body.similarNames).toHaveLength(10);
    });

    it("returns 400 if name search returns BAD_INPUT", async () => {
      stubBusinessNameClient.search.mockRejectedValue("BAD_INPUT");
      const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
      expect(response.status).toEqual(400);
    });

    it("returns 500 if name search errors", async () => {
      stubBusinessNameClient.search.mockRejectedValue({});
      const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
      expect(response.status).toEqual(500);
    });
  });
});
