import { removeBusiness } from "@/lib/domain-logic/removeBusiness";
import { generateBusiness, generateUserData } from "@businessnjgovnavigator/shared/test";

describe("remove business", () => {
  it("removes a business from userData by ID when not current", () => {
    const firstBusiness = generateBusiness({});
    const secondBusiness = generateBusiness({});
    const userData = generateUserData({
      currentBusinessId: firstBusiness.id,
      businesses: {
        [firstBusiness.id]: firstBusiness,
        [secondBusiness.id]: secondBusiness
      }
    });
    const newUserData = removeBusiness({
      userData,
      idToRemove: secondBusiness.id,
      newCurrentBusinessId: firstBusiness.id
    });

    expect(Object.keys(newUserData.businesses)).toHaveLength(1);
    expect(newUserData.currentBusinessId).toEqual(firstBusiness.id);
    expect(newUserData.businesses).toEqual({ [firstBusiness.id]: firstBusiness });
  });

  it("removes a business from userData by ID when it is current", () => {
    const firstBusiness = generateBusiness({});
    const secondBusiness = generateBusiness({});
    const userData = generateUserData({
      currentBusinessId: firstBusiness.id,
      businesses: {
        [firstBusiness.id]: firstBusiness,
        [secondBusiness.id]: secondBusiness
      }
    });
    const newUserData = removeBusiness({
      userData,
      idToRemove: firstBusiness.id,
      newCurrentBusinessId: secondBusiness.id
    });

    expect(Object.keys(newUserData.businesses)).toHaveLength(1);
    expect(newUserData.currentBusinessId).toEqual(secondBusiness.id);
    expect(newUserData.businesses).toEqual({ [secondBusiness.id]: secondBusiness });
  });
});
