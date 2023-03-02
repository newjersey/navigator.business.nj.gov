import { generateV105ProfileData, generateV105UserData } from "./v105_add_pet_care_essential_question";
import { migrate_v105_to_v106 } from "./v106_renamed_address_city_and_address_municipality";

describe("migrate_v105_to_v106", () => {
  it("shows addressCity values as foreignAddressCity and addressMunicipality values as domesticAddressMunicipality", () => {
    const v105 = generateV105UserData({
      profileData: generateV105ProfileData({}),
    });
    const v106 = migrate_v105_to_v106(v105);
    const formationFormDataObject = { ...v105.formationData.formationFormData };
    delete formationFormDataObject.addressCity;
    delete formationFormDataObject.addressMunicipality;

    // expect((v106.formationData.formationFormData as any)["addressCity"]).toBeUndefined()
    // const formDataKeys = Object.keys(v106.formationData.formationFormData)
    // expect(formDataKeys.includes("addressCity")).toBe(false)


    expect(v106).toEqual({
      ...v105,
      formationData: {
        ...v105.formationData,
        formationFormData: {
          ...formationFormDataObject,
          domesticAddressMunicipality: v105.formationData.formationFormData.addressMunicipality,
          foreignAddressCity: v105.formationData.formationFormData.addressCity,
        },
      },
      version: 106,
    });
  });
});
