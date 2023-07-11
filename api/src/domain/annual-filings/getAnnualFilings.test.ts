import { Business } from "@shared/business";
import { getCurrentBusinessForUser, getUserDataWithUpdatedCurrentBusiness } from "@shared/businessHelpers";
import {
  generateProfileData,
  generateTaxFilingCalendarEvent,
  generateTaxFilingData,
  generateUser,
  generateUserDataPrime,
  getFirstAnnualFiling,
  getSecondAnnualFiling,
  getThirdAnnualFiling,
} from "@shared/test";
import { generateAnnualFilings } from "../../../test/helpers";
import { getAnnualFilings } from "./getAnnualFilings";

describe("getAnnualFilings", () => {
  it("calculates 3 new annual filing datea and updates them for dateOfFormation", async () => {
    const formationDate = "2021-03-01";

    const postedUserData = generateUserDataPrime({
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

    const response = getAnnualFilings(postedUserData);
    const currentBusiness = getCurrentBusinessForUser(postedUserData);
    const expectedBusiness: Business = {
      ...currentBusiness,
      taxFilingData: {
        ...currentBusiness.taxFilingData,
        filings: generateAnnualFilings([
          getFirstAnnualFiling(formationDate),
          getSecondAnnualFiling(formationDate),
          getThirdAnnualFiling(formationDate),
        ]),
      },
    };
    const expectedUserData = getUserDataWithUpdatedCurrentBusiness(postedUserData, expectedBusiness);

    expect(response).toEqual(expectedUserData);
  });

  it("calculates 3 new annual filing dates and overrides existing dates if needed", async () => {
    const formationDate = "2021-03-01";

    const postedUserData = generateUserDataPrime({
      user: generateUser({ id: "123" }),
      profileData: generateProfileData({
        dateOfFormation: formationDate,
        entityId: undefined,
        legalStructureId: "limited-liability-company",
      }),
      taxFilingData: generateTaxFilingData({
        filings: [generateTaxFilingCalendarEvent({ identifier: "ANNUAL_FILING", dueDate: "2019-10-31" })],
      }),
    });

    const response = getAnnualFilings(postedUserData);
    const currentBusiness = getCurrentBusinessForUser(postedUserData);
    const expectedBusiness: Business = {
      ...currentBusiness,
      taxFilingData: {
        ...currentBusiness.taxFilingData,
        filings: generateAnnualFilings([
          getFirstAnnualFiling(formationDate),
          getSecondAnnualFiling(formationDate),
          getThirdAnnualFiling(formationDate),
        ]),
      },
    };
    const expectedUserData = getUserDataWithUpdatedCurrentBusiness(postedUserData, expectedBusiness);

    expect(response).toEqual(expectedUserData);
  });

  it("calculates 3 new annual filing dates and updates them for dateOfFormation when there is no legalStructureId", async () => {
    const formationDate = "2021-03-01";

    const postedUserData = generateUserDataPrime({
      user: generateUser({ id: "123" }),
      profileData: generateProfileData({
        dateOfFormation: formationDate,
        entityId: undefined,
        legalStructureId: undefined,
      }),
      taxFilingData: generateTaxFilingData({
        filings: [],
      }),
    });

    const response = getAnnualFilings(postedUserData);
    const currentBusiness = getCurrentBusinessForUser(postedUserData);
    const expectedBusiness: Business = {
      ...currentBusiness,
      taxFilingData: {
        ...currentBusiness.taxFilingData,
        filings: generateAnnualFilings([
          getFirstAnnualFiling(formationDate),
          getSecondAnnualFiling(formationDate),
          getThirdAnnualFiling(formationDate),
        ]),
      },
    };
    const expectedUserData = getUserDataWithUpdatedCurrentBusiness(postedUserData, expectedBusiness);

    expect(response).toEqual(expectedUserData);
  });

  it("removes the annual filing object if the users industry does not require public filings", async () => {
    const postedUserData = generateUserDataPrime({
      user: generateUser({ id: "123" }),
      profileData: generateProfileData({
        dateOfFormation: "2021-03-01",
        entityId: undefined,
        legalStructureId: "sole-proprietorship",
      }),
      taxFilingData: generateTaxFilingData({
        filings: [generateTaxFilingCalendarEvent({ identifier: "ANNUAL_FILING", dueDate: "2019-10-31" })],
      }),
    });

    const response = getAnnualFilings(postedUserData);
    const currentBusiness = getCurrentBusinessForUser(response);
    const expectedBusiness: Business = {
      ...currentBusiness,
      taxFilingData: generateTaxFilingData({ filings: [] }),
    };
    const expectedUserData = getUserDataWithUpdatedCurrentBusiness(response, expectedBusiness);

    expect(response).toEqual(expectedUserData);
  });
});
