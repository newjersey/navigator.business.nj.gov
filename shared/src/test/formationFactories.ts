import { randomElementFromArray } from "../arrayHelpers";
import { arrayOfCountriesObjects as countries } from "../countries";
import { getCurrentDate } from "../dateHelpers";
import { defaultDateFormat } from "../defaultConstants";
import {
  allFormationLegalTypes,
  BusinessSignerTypeMap,
  BusinessSuffix,
  BusinessSuffixMap,
  corpLegalStructures,
  foreignLegalTypePrefix,
  FormationAddress,
  FormationFormData,
  FormationIncorporator,
  FormationLegalType,
  FormationMember,
  FormationSigner,
  incorporationLegalStructures,
  PublicFilingLegalType,
  publicFilingLegalTypes,
} from "../formationData";
import { randomInt, randomIntFromInterval } from "../intHelpers";
import { arrayOfStateObjects as states } from "../states";
import { generateMunicipality } from "./factories";

export const generateFormationUSAddress = (overrides: Partial<FormationAddress>): FormationAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressCity: `some-address-city-${randomInt()}`,
    addressState: randomElementFromArray(
      states.filter((state) => {
        return state.shortCode !== "NJ";
      })
    ),
    addressCountry: "US",
    businessLocationType: "US",
    addressZipCode: randomInt(5).toString(),
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
    addressState: undefined,
    addressMunicipality: undefined,
    businessLocationType: "INTL",
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
    addressMunicipality: generateMunicipality({ displayName: "Newark Display Name", name: "Newark" }),
    addressCity: undefined,
    businessLocationType: "NJ",
    addressProvince: undefined,
    addressCountry: "US",
    addressState: { shortCode: "NJ", name: "New Jersey" },
    addressZipCode: `0${randomIntFromInterval("07001", "08999")}`,
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

export const randomFormationLegalType = () => {
  return randomElementFromArray(allFormationLegalTypes as unknown as FormationLegalType[]);
};

export const randomPublicFilingLegalType = (filter?: (legalType: PublicFilingLegalType) => boolean) => {
  return randomElementFromArray(
    (publicFilingLegalTypes as unknown as PublicFilingLegalType[]).filter((value) =>
      filter ? filter(value) : true
    )
  );
};

export const generateFormationSigner = (
  overrides: Partial<FormationSigner>,
  legalStructureId?: FormationLegalType
): FormationSigner => {
  return {
    name: `some-signer-name-${randomInt()}`,
    signature: false,
    title: randomElementFromArray(BusinessSignerTypeMap[legalStructureId ?? randomFormationLegalType()]),
    ...overrides,
  };
};

export const randomBusinessSuffix = (legalStructureId: FormationLegalType): BusinessSuffix => {
  try {
    return randomElementFromArray(BusinessSuffixMap[legalStructureId]);
  } catch (error) {
    console.log(legalStructureId);
    throw error;
  }
};

export const generateFormationIncorporator = (
  overrides: Partial<FormationIncorporator>,
  legalStructureId?: FormationLegalType
): FormationIncorporator => {
  return {
    ...generateFormationSigner({}, legalStructureId),
    name: `some-incorporator-name-${randomInt()}`,
    ...generateFormationUSAddress({}),
    ...overrides,
  };
};

export const generateFormationFormData = (
  overrides: Partial<FormationFormData>,
  options?: {
    legalStructureId?: FormationLegalType;
  }
): FormationFormData => {
  const legalStructureId = options?.legalStructureId ?? randomFormationLegalType();
  const isForeign = legalStructureId.includes(foreignLegalTypePrefix);
  const isCorp = corpLegalStructures.includes(legalStructureId);
  const usesIncorporation = incorporationLegalStructures.includes(legalStructureId);
  let businessAddress = generateFormationNJAddress({});
  if (isForeign) {
    businessAddress = randomInt() % 2 ? generateFormationForeignAddress({}) : generateFormationUSAddress({});
  }
  return {
    ...businessAddress,
    legalType: legalStructureId,
    businessName: `some-business-name-${randomInt()}`,
    businessSuffix: randomBusinessSuffix(legalStructureId),
    businessStartDate: getCurrentDate().add(1, "days").format(defaultDateFormat),
    businessTotalStock: isCorp ? randomInt().toString() ?? "" : "",
    businessPurpose: `some-purpose-${randomInt()}`,
    provisions: [`some-provision-${randomInt()}`],
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}@gmail.com`,
    agentOfficeAddressLine1: `agent-office-addr-1-${randomInt()}`,
    agentOfficeAddressLine2: `agent-office-addr-2-${randomInt()}`,
    agentOfficeAddressCity: `agent-office-addr-city-${randomInt()}`,
    agentOfficeAddressMunicipality: generateMunicipality({}),
    agentOfficeAddressZipCode: `0${randomIntFromInterval("07001", "08999").toString()}`,
    agentUseAccountInfo: !!(randomInt() % 2),
    agentUseBusinessAddress: !!(randomInt() % 2),
    members: isForeign ? undefined : [generateFormationMember({})],
    signers: usesIncorporation
      ? undefined
      : [
          generateFormationSigner({ signature: true }, legalStructureId),
          generateFormationSigner({ signature: true }, legalStructureId),
        ],
    incorporators: usesIncorporation
      ? [
          generateFormationIncorporator({ signature: true }, legalStructureId),
          generateFormationIncorporator({ signature: true }, legalStructureId),
        ]
      : undefined,
    paymentType: randomInt() % 2 ? "ACH" : "CC",
    annualReportNotification: !!(randomInt() % 2),
    corpWatchNotification: !!(randomInt() % 2),
    officialFormationDocument: !!(randomInt() % 2),
    certificateOfStanding: !!(randomInt() % 2),
    certifiedCopyOfFormationDocument: !!(randomInt() % 2),
    contactFirstName: `some-contact-first-name-${randomInt()}`,
    contactLastName: `some-contact-last-name-${randomInt()}`,
    contactPhoneNumber: `some-contact-phone-number-${randomInt()}`,
    withdrawals: `some-withdrawals-text-${randomInt()}`,
    dissolution: `some-dissolution-text-${randomInt()}`,
    combinedInvestment: `some-combinedInvestment-text-${randomInt()}`,
    canCreateLimitedPartner: !!(randomInt() % 2),
    createLimitedPartnerTerms: `some-createLimitedPartnerTerms-text-${randomInt()}`,
    canGetDistribution: !!(randomInt() % 2),
    getDistributionTerms: `some-getDistributionTerms-text-${randomInt()}`,
    canMakeDistribution: !!(randomInt() % 2),
    makeDistributionTerms: `some-makeDistributionTerms-text-${randomInt()}`,
    foreignStateOfFormation: isForeign ? randomElementFromArray(states).name : undefined,
    foreignDateOfFormation: isForeign ? getCurrentDate().add(1, "days").format(defaultDateFormat) : undefined,
    foreignGoodStandingFile: undefined,
    ...overrides,
  };
};
