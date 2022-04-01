import bodyParser from "body-parser";
import express, { Express } from "express";
import request from "supertest";
import { generateProfileData, generateUser, generateUserData } from "../../test/factories";
import { determineAnnualFilingDate } from "../../test/helpers";
import { guestRouterFactory } from "./guestRouter";

describe("guestRouter", () => {
  let app: Express;

  beforeEach(async () => {
    app = express();
    app.use(bodyParser.json());
    app.use(guestRouterFactory());
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  describe("POST", () => {
    describe("annualFilings", () => {
      it("calculates new annual filing date and updates it for dateOfFormation", async () => {
        const postedUserData = generateUserData({
          user: generateUser({ id: "123" }),
          profileData: generateProfileData({
            dateOfFormation: "2021-03-01",
            entityId: undefined,
            legalStructureId: "limited-liability-company",
          }),
          taxFilingData: { filings: [] },
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
  });
});
