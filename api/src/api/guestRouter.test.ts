import { NameAvailability } from "@shared/businessNameSearch";
import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import {
  generateBusinessNameAvailability,
  generateProfileData,
  generateTaxFilingData,
  generateUser,
  generateUserData,
  getFirstAnnualFiling,
  getSecondAnnualFiling,
  getThirdAnnualFiling,
} from "@shared/test";
import { Express } from "express";
import request from "supertest";
import { generateAnnualFilings } from "../../test/helpers";
import { TimeStampBusinessSearch } from "../domain/types";
import { setupExpress } from "../libs/express";
import { guestRouterFactory } from "./guestRouter";

describe("guestRouter", () => {
  let app: Express;
  let timeStampBusinessSearch: jest.Mocked<TimeStampBusinessSearch>;

  beforeEach(async () => {
    timeStampBusinessSearch = { search: jest.fn() };
    app = setupExpress(false);
    app.use(guestRouterFactory(timeStampBusinessSearch));
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  describe("POST annualFilings", () => {
    it("calculates 3 new annual filing dates and updates them for dateOfFormation", async () => {
      const formationDate = "2021-03-01";

      const postedUserData = generateUserData({
        user: generateUser({ id: "123" }),
        profileData: generateProfileData({
          dateOfFormation: formationDate,
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
          filings: generateAnnualFilings([
            getFirstAnnualFiling(formationDate),
            getSecondAnnualFiling(formationDate),
            getThirdAnnualFiling(formationDate),
          ]),
        },
      });
    });
  });

  describe("GET /business-name-availability", () => {
    it("returns the availability status", async () => {
      const result: NameAvailability = generateBusinessNameAvailability({
        status: "AVAILABLE",
      });
      timeStampBusinessSearch.search.mockResolvedValue(result);

      const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
      expect(response.status).toEqual(200);
      expect(result.status).toEqual(result.status);
      expect(parseDate(response.body.lastUpdatedTimeStamp).isSame(getCurrentDate(), "minute")).toEqual(true);
    });

    it("returns 400 if name search returns BAD_INPUT", async () => {
      timeStampBusinessSearch.search.mockRejectedValue("BAD_INPUT");
      const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
      expect(response.status).toEqual(400);
    });

    it("returns 500 if name search errors", async () => {
      timeStampBusinessSearch.search.mockRejectedValue({});
      const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
      expect(response.status).toEqual(500);
    });
  });
});
