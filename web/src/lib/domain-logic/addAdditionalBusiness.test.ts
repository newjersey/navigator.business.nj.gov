/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { addAdditionalBusiness } from "@/lib/domain-logic/addAdditionalBusiness";
import { createEmptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { CURRENT_VERSION } from "@businessnjgovnavigator/shared/userData";

describe("addAdditionalBusiness", () => {
  it("adds a new empty business to a userData", () => {
    const firstBusiness = generateBusiness({});
    const userData = generateUserDataForBusiness(firstBusiness);
    const newUserData = addAdditionalBusiness(userData);

    expect(Object.keys(newUserData.businesses)).toHaveLength(2);
    const newBusinessId = Object.keys(newUserData.businesses).find((id) => id !== firstBusiness.id)!;

    expect(newUserData.currentBusinessId).toBeDefined();
    expect(newUserData.currentBusinessId).not.toEqual(firstBusiness.id);
    expect(newUserData.currentBusinessId).toEqual(newBusinessId);

    expect(newUserData.businesses[newBusinessId].profileData).toEqual(createEmptyProfileData());
  });

  it("adds a new empty business with matching userId", () => {
    const userId = "multiple-biz-user-123";
    const firstBusiness = generateBusiness({ userId: userId });
    const userData = generateUserDataForBusiness(firstBusiness);
    const newUserData = addAdditionalBusiness(userData);

    expect(Object.keys(newUserData.businesses)).toHaveLength(2);
    const newBusinessId = Object.keys(newUserData.businesses).find((id) => id !== firstBusiness.id)!;

    expect(newUserData.businesses[newBusinessId].userId).toEqual(userId);
  });

  it("adds a new empty business with versionWhenAdded as the userData's current version", () => {
    const userId = "multiple-biz-user-123";
    const firstBusiness = generateBusiness({
      userId: userId,
      versionWhenCreated: 153,
      version: CURRENT_VERSION,
    });
    const userData = generateUserDataForBusiness(firstBusiness, {
      version: CURRENT_VERSION,
      versionWhenCreated: 153,
    });
    const newUserData = addAdditionalBusiness(userData);

    expect(Object.keys(newUserData.businesses)).toHaveLength(2);
    const newBusinessId = Object.keys(newUserData.businesses).find((id) => id !== firstBusiness.id)!;

    expect(newUserData.businesses[newBusinessId].versionWhenCreated).toEqual(CURRENT_VERSION);
  });
});
