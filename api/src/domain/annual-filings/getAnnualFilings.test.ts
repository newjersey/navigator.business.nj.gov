import {
  generateProfileData,
  generateTaxFilingData,
  generateUser,
  generateUserData,
} from "../../../test/factories";
import { generateAnnualFilings } from "../../../test/helpers";
import { getAnnualFilings } from "./getAnnualFilings";

describe("getAnnualFilings", () => {
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

    const response = getAnnualFilings(postedUserData);

    expect(response).toEqual({
      ...postedUserData,
      taxFilingData: {
        ...postedUserData.taxFilingData,
        filings: generateAnnualFilings("2021-03-01"),
      },
    });
  });

  it("calculates new annual filing date and overrides it if needed", async () => {
    const postedUserData = generateUserData({
      user: generateUser({ id: "123" }),
      profileData: generateProfileData({
        dateOfFormation: "2021-03-01",
        entityId: undefined,
        legalStructureId: "limited-liability-company",
      }),
      taxFilingData: generateTaxFilingData({
        filings: [{ identifier: "ANNUAL_FILING", dueDate: "2019-10-31" }],
      }),
    });

    const response = getAnnualFilings(postedUserData);

    expect(response).toEqual({
      ...postedUserData,
      taxFilingData: {
        ...postedUserData.taxFilingData,
        filings: generateAnnualFilings("2021-03-01"),
      },
    });
  });

  it("calculates new annual filing date and updates it for dateOfFormation when there is no legalStructureId", async () => {
    const postedUserData = generateUserData({
      user: generateUser({ id: "123" }),
      profileData: generateProfileData({
        dateOfFormation: "2021-03-01",
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
        filings: generateAnnualFilings("2021-03-31"),
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
        filings: [{ identifier: "ANNUAL_FILING", dueDate: "2019-10-31" }],
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
