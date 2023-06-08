import {
  generateProfileData,
  generateTaxFilingCalendarEvent,
  generateTaxFilingData,
  generateUser,
  generateUserData,
  getFirstAnnualFiling,
  getSecondAnnualFiling,
  getThirdAnnualFiling,
} from "@shared/test";
import { generateAnnualFilings } from "../../../test/helpers";
import { getAnnualFilings } from "./getAnnualFilings";

describe("getAnnualFilings", () => {
  it("calculates 3 new annual filing datea and updates them for dateOfFormation", async () => {
    const formationDate = "2021-03-01";

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

    const response = getAnnualFilings(postedUserData);

    expect(response).toEqual({
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

  it("calculates 3 new annual filing dates and overrides existing dates if needed", async () => {
    const formationDate = "2021-03-01";

    const postedUserData = generateUserData({
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

    expect(response).toEqual({
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

  it("calculates 3 new annual filing dates and updates them for dateOfFormation when there is no legalStructureId", async () => {
    const formationDate = "2021-03-01";

    const postedUserData = generateUserData({
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

    expect(response).toEqual({
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

  it("removes the annual filing object if the users industry does not require public filings", async () => {
    const postedUserData = generateUserData({
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

    expect(response).toEqual({
      ...postedUserData,
      taxFilingData: generateTaxFilingData({
        filings: [],
      }),
    });
  });
});
