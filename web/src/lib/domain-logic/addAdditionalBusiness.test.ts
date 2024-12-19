/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { addAdditionalBusiness } from "@/lib/domain-logic/addAdditionalBusiness";
import { createEmptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateUserData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";

describe("addAdditionalBusiness", () => {
  it("adds a new empty business to a userData", () => {
    const firstBusiness = generateBusiness(generateUserData({}), {});
    const userData = generateUserDataForBusiness(firstBusiness);
    const newUserData = addAdditionalBusiness(userData);

    expect(Object.keys(newUserData.businesses)).toHaveLength(2);
    const newBusinessId = Object.keys(newUserData.businesses).find((id) => id !== firstBusiness.id)!;

    expect(newUserData.currentBusinessId).toBeDefined();
    expect(newUserData.currentBusinessId).not.toEqual(firstBusiness.id);
    expect(newUserData.currentBusinessId).toEqual(newBusinessId);

    expect(newUserData.businesses[newBusinessId].profileData).toEqual(createEmptyProfileData());
  });
});
