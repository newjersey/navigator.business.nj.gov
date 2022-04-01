import { generateProfileData, generateUser, generateUserData } from "../../../test/factories";
import { determineAnnualFilingDate } from "../../../test/helpers";
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
      taxFilingData: { filings: [] },
    });

    const response = getAnnualFilings(postedUserData);

    expect(response).toEqual({
      ...postedUserData,
      taxFilingData: {
        ...postedUserData.taxFilingData,
        filings: [{ identifier: "ANNUAL_FILING", dueDate: determineAnnualFilingDate("2021-03-01") }],
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
      taxFilingData: {
        filings: [{ identifier: "ANNUAL_FILING", dueDate: "2019-10-31" }],
      },
    });

    const response = getAnnualFilings(postedUserData);

    expect(response).toEqual({
      ...postedUserData,
      taxFilingData: {
        filings: [{ identifier: "ANNUAL_FILING", dueDate: determineAnnualFilingDate("2021-03-01") }],
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
      taxFilingData: { filings: [] },
    });

    const response = getAnnualFilings(postedUserData);

    expect(response).toEqual({
      ...postedUserData,
      taxFilingData: {
        ...postedUserData.taxFilingData,
        filings: [{ identifier: "ANNUAL_FILING", dueDate: determineAnnualFilingDate("2021-03-31") }],
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
      taxFilingData: {
        filings: [{ identifier: "ANNUAL_FILING", dueDate: "2019-10-31" }],
      },
    });

    const response = getAnnualFilings(postedUserData);

    expect(response).toEqual({
      ...postedUserData,
      taxFilingData: {
        filings: [],
      },
    });
  });
});
