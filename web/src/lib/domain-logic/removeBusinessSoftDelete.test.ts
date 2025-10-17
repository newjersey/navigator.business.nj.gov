import { generateBusiness, generateUserData } from "@businessnjgovnavigator/shared/test";
import { removeBusinessSoftDelete } from "@/lib/domain-logic/removeBusinessSoftDelete";

describe("remove business soft delete", () => {
  it("sets deletion iso date", () => {
    const firstBusiness = generateBusiness({});
    const secondBusiness = generateBusiness({});
    const userData = generateUserData({
      currentBusinessId: firstBusiness.id,
      businesses: {
        [firstBusiness.id]: firstBusiness,
        [secondBusiness.id]: secondBusiness,
      },
    });
    const newUserData = removeBusinessSoftDelete({
      userData,
      idToSoftDelete: secondBusiness.id,
      newCurrentBusinessId: firstBusiness.id,
    });

    expect(Object.keys(newUserData.businesses)).toHaveLength(2);
    expect(newUserData.currentBusinessId).toEqual(firstBusiness.id);
    expect(newUserData.businesses[secondBusiness.id].dateDeletedISO).not.toEqual("");
    expect(newUserData.businesses[firstBusiness.id].dateDeletedISO).toEqual("");
  });
});
