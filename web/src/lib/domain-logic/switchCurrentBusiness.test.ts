import { switchCurrentBusiness } from "@/lib/domain-logic/switchCurrentBusiness";
import { generateBusiness, generateUserData } from "@businessnjgovnavigator/shared/test";

describe("switch business", () => {
  it("sets given id to current", () => {
    const firstBusiness = generateBusiness(generateUserData({}), {});
    const secondBusiness = generateBusiness(generateUserData({}), {});
    const userData = generateUserData({
      currentBusinessId: firstBusiness.id,
      businesses: {
        [firstBusiness.id]: firstBusiness,
        [secondBusiness.id]: secondBusiness,
      },
    });
    const newUserData = switchCurrentBusiness(userData, secondBusiness.id);

    expect(newUserData.currentBusinessId).toEqual(secondBusiness.id);
    expect(newUserData.businesses).toEqual(userData.businesses);
  });
});
