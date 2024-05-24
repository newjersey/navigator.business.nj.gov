import { guestRouterFactory } from "@api/guestRouter";
import { TimeStampBusinessSearch } from "@domain/types";
import { setupExpress } from "@libs/express";
import { NameAvailability } from "@shared/businessNameSearch";
import { getCurrentDate, parseDate } from "@shared/dateHelpers";
import {
  generateBusiness,
  generateBusinessNameAvailability,
  generateProfileData,
  generateTaxFilingData,
  generateUser,
  generateUserDataForBusiness,
  getFirstAnnualFiling,
  getSecondAnnualFiling,
  getThirdAnnualFiling,
  modifyCurrentBusiness,
} from "@shared/test";
import { generateAnnualFilings } from "@test/helpers";
import dayjs from "dayjs";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

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
      const formationDate = dayjs().subtract(3, "year").add(1, "month").day(1).format("YYYY-MM-DD");

      const business = generateBusiness({
        profileData: generateProfileData({
          dateOfFormation: formationDate,
          entityId: undefined,
          legalStructureId: "limited-liability-company",
        }),
        taxFilingData: generateTaxFilingData({
          filings: [],
        }),
      });
      const postedUserData = generateUserDataForBusiness(business, { user: generateUser({ id: "123" }) });

      const response = await request(app).post(`/annualFilings`).send(postedUserData);
      const expectedUserData = modifyCurrentBusiness(postedUserData, (business) => ({
        ...business,
        taxFilingData: {
          ...business.taxFilingData,
          filings: generateAnnualFilings([
            getFirstAnnualFiling(formationDate),
            getSecondAnnualFiling(formationDate),
            getThirdAnnualFiling(formationDate),
          ]),
        },
      }));
      expect(response.body).toEqual(expectedUserData);
    });
  });

  describe("GET /business-name-availability", () => {
    it("returns the availability status", async () => {
      const result: NameAvailability = generateBusinessNameAvailability({
        status: "AVAILABLE",
      });
      timeStampBusinessSearch.search.mockResolvedValue(result);

      const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
      expect(response.status).toEqual(StatusCodes.OK);
      expect(result.status).toEqual(result.status);
      expect(parseDate(response.body.lastUpdatedTimeStamp).isSame(getCurrentDate(), "minute")).toEqual(true);
    });

    it("returns Bad Request if name search returns BAD_INPUT", async () => {
      timeStampBusinessSearch.search.mockRejectedValue("BAD_INPUT");
      const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
      expect(response.status).toEqual(StatusCodes.BAD_REQUEST);
    });

    it("returns Internal Server Error if name search errors", async () => {
      timeStampBusinessSearch.search.mockRejectedValue({});
      const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
