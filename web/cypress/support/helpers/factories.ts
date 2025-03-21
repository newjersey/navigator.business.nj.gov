import {
  randomElementFromArray,
  randomFormationLegalType,
} from "@businessnjgovnavigator/cypress/support/helpers/helpers";
import {
  BusinessSignerTypeMap,
  arrayOfCountriesObjects as countries,
  FormationAddress,
  FormationLegalType,
  FormationMember,
  FormationSigner,
  Municipality,
  randomInt,
  randomIntFromInterval,
  arrayOfStateObjects as states,
} from "@businessnjgovnavigator/shared/";

export const generateMunicipality = (overrides: Partial<Municipality>): Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};
export const generateFormationUSAddress = (overrides: Partial<FormationAddress>): FormationAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-address-city-${randomInt()}`,
    addressState: randomElementFromArray(
      states.filter((state) => {
        return (
          state.shortCode !== "NJ" &&
          state.shortCode !== "AS" &&
          state.shortCode !== "VI" &&
          state.shortCode !== "GU"
        );
      })
    ),
    addressCountry: "US",
    addressZipCode: randomInt(5).toString(),
    businessLocationType: "US",
    addressMunicipality: undefined,
    addressProvince: undefined,
    ...overrides,
  };
};
export const generateFormationForeignAddress = (overrides: Partial<FormationAddress>): FormationAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-address-city-${randomInt()}`,
    businessLocationType: "INTL",
    addressState: undefined,
    addressMunicipality: undefined,
    addressCountry: randomElementFromArray(
      countries.filter((item) => {
        return item.shortCode !== "US";
      })
    ).shortCode,
    addressProvince: `some-address-province-${randomInt()}`,
    addressZipCode: randomInt(11).toString(),
    ...overrides,
  };
};
export const generateFormationNJAddress = (overrides: Partial<FormationAddress>): FormationAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressMunicipality: generateMunicipality({ displayName: "Newark", name: "Newark" }),
    addressCity: undefined,
    addressProvince: undefined,
    addressCountry: "US",
    businessLocationType: "NJ",
    addressState: { shortCode: "NJ", name: "New Jersey" },
    addressZipCode: `0${randomIntFromInterval("07001", "08999").toString()}`,
    ...overrides,
  };
};
export const generateFormationMember = (overrides: Partial<FormationMember>): FormationMember => {
  return {
    name: `some-members-name-${randomInt()}`,
    ...generateFormationUSAddress({}),
    ...overrides,
  };
};
export const generateFormationSigner = (
  overrides: Partial<FormationSigner>,
  legalStructureId?: FormationLegalType
): FormationSigner => {
  return {
    name: `some-signer-name-${randomInt()}`,
    signature: false,
    title: getSignerType(legalStructureId),
    ...overrides,
  };
};
const getSignerType = (legalStructureId?: FormationLegalType) => {
  return randomElementFromArray(
    legalStructureId
      ? BusinessSignerTypeMap[legalStructureId]
      : BusinessSignerTypeMap[randomFormationLegalType()]
  );
};
