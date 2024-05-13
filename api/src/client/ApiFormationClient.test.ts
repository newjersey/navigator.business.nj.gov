/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FormationClient } from "@domain/types";
import { DummyLogWriter, LogWriter, LogWriterType } from "@libs/logWriter";
import { getCurrentDate, getCurrentDateISOString, parseDate, parseDateWithFormat } from "@shared/dateHelpers";
import { defaultDateFormat } from "@shared/defaultConstants";
import { FormationFormData, FormationLegalType, formationApiDateFormat } from "@shared/formationData";
import { randomInt } from "@shared/intHelpers";
import {
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateFormationIncorporator,
  generateFormationMember,
  generateFormationNJAddress,
  generateFormationSigner,
  generateFormationUSAddress,
  generateProfileData,
  generateUserDataForBusiness,
} from "@shared/test";
import { generateFormationUserData, generateInputFile } from "@test/factories";
import axios from "axios";

import { ApiFormationClient } from "@client/ApiFormationClient";
import { ApiError, ApiGetFilingResponse, ApiResponse, ApiSubmission } from "@client/ApiFormationHelpers";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { UserData } from "@shared/userData";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

const DEBUG = Boolean(process.env.DEBUG ?? false);

process.env.FEATURE_FORMATION_CONTENT_TYPE_PLAIN_ONLY = "true";

const generateApiResponse = (overrides: Partial<ApiResponse>): ApiResponse => {
  return {
    Success: true,
    Id: `some-id-${Math.random()}`,
    PayUrl: {
      PortalPayId: `some-pay-id-${Math.random()}`,
      RedirectToUrl: `some-redirect-url-${Math.random()}`,
      StatusCode: 1,
    },
    ...overrides,
  };
};

const generateApiError = (overrides: Partial<ApiError>): ApiError => {
  return {
    Valid: false,
    ErrorMessage: `some-error-message-${Math.random()}`,
    Name: `some-error-name-${Math.random()}`,
    ...overrides,
  };
};

const stubGenerateApiResponse = (overrides: Partial<ApiGetFilingResponse>): ApiGetFilingResponse => {
  return {
    Success: true,
    BusinessName: `some-BusinessName-${Math.random()}`,
    EntityId: `some-EntityId-${Math.random()}`,
    TransactionDate: getCurrentDateISOString(),
    ConfirmationNumber: `some-ConfirmationNumber-${Math.random()}`,
    FormationDoc: `some-FormationDoc-${Math.random()}`,
    StandingDoc: `some-StandingDoc-${Math.random()}`,
    CertifiedDoc: `some-CertifiedDoc-${Math.random()}`,
    ...overrides,
  };
};

describe("ApiFormationClient", () => {
  let client: FormationClient;
  let logger: LogWriterType;

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = ApiFormationClient(
      { account: "12345", key: "abcdef", baseUrl: "example.com/formation" },
      DEBUG ? logger : DummyLogWriter
    );
  });

  describe("form", () => {
    describe("when LLC", () => {
      it("posts to the endpoint for a domestic user", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });
        const members = [
          generateFormationMember(generateFormationNJAddress({})),
          generateFormationMember(generateFormationUSAddress({})),
        ];

        const formationFormData = generateFormationFormData(
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            additionalProvisions: ["provision1", "provision2"],
            members,
            signers: [
              generateFormationSigner({
                name: "faraz",
                signature: true,
                title: "Authorized Representative",
              }),
              generateFormationSigner({
                name: "anne",
                signature: true,
                title: "Authorized Representative",
              }),
              generateFormationSigner({
                name: "mike",
                signature: false,
                title: "Authorized Representative",
              }),
            ],
          },

          { legalStructureId: "limited-liability-company" }
        );

        const userData = generateFormationUserData(
          { legalStructureId: "limited-liability-company", businessPersona: "STARTING" },
          {},
          formationFormData
        );
        const currentBusiness = getCurrentBusiness(userData);

        await client.form(userData, "navigator.com/form-business");

        expect(mockAxios.post).toHaveBeenCalledWith(
          "example.com/formation/PrepareFiling",
          {
            Account: "12345",
            Key: "abcdef",
            ReturnUrl: "navigator.com/form-business?completeFiling=true",
            FailureReturnUrl: "navigator.com/form-business?completeFiling=false",
            Payer: {
              CompanyName: formationFormData.businessName,
              Address1: formationFormData.addressLine1,
              Address2: formationFormData.addressLine2,
              City: formationFormData.addressMunicipality?.name,
              StateAbbreviation: "NJ",
              ZipCode: formationFormData.addressZipCode,
              Email: userData.user.email,
            },
            Formation: {
              Gov2GoAnnualReports: formationFormData.annualReportNotification,
              Gov2GoCorpWatch: formationFormData.corpWatchNotification,
              ShortGoodStanding: formationFormData.certificateOfStanding,
              Certified: formationFormData.certifiedCopyOfFormationDocument,
              PayerEmail: userData.user.email,
              SelectPaymentType: formationFormData.paymentType,
              BusinessInformation: {
                CompanyOrigin: "Domestic",
                Business: "DomesticLimitedLiabilityCompany",
                BusinessName: formationFormData.businessName,
                BusinessDesignator: formationFormData.businessSuffix,
                Naic: currentBusiness.profileData.naicsCode,
                BusinessPurpose: formationFormData.businessPurpose,
                EffectiveFilingDate: parseDateWithFormat(
                  formationFormData.businessStartDate,
                  defaultDateFormat
                ).format(formationApiDateFormat),
                MainAddress: {
                  Address1: formationFormData.addressLine1,
                  Address2: formationFormData.addressLine2,
                  City: formationFormData.addressMunicipality?.name,
                  State: "New Jersey",
                  Zipcode: formationFormData.addressZipCode,
                  Country: "US",
                },
              },
              AdditionalLimitedLiabilityCompany: {
                OtherProvisions: [{ Provision: "provision1" }, { Provision: "provision2" }],
              },
              CompanyProfit: "Profit",
              RegisteredAgent: {
                Id: undefined,
                Email: formationFormData.agentEmail,
                Name: formationFormData.agentName,
                Location: {
                  Address1: formationFormData.agentOfficeAddressLine1,
                  Address2: formationFormData.agentOfficeAddressLine2,
                  City: formationFormData.agentOfficeAddressCity,
                  State: "New Jersey",
                  Zipcode: formationFormData.agentOfficeAddressZipCode,
                  Country: "US",
                },
              },
              Members: [
                {
                  Name: members[0].name,
                  Location: {
                    Address1: members[0].addressLine1,
                    Address2: members[0].addressLine2,
                    City: members[0].addressMunicipality?.name,
                    State: "New Jersey",
                    Zipcode: members[0].addressZipCode,
                    Country: "US",
                  },
                },
                {
                  Name: members[1].name,
                  Location: {
                    Address1: members[1].addressLine1,
                    Address2: members[1].addressLine2,
                    City: members[1].addressCity,
                    State: members[1].addressState?.name,
                    Zipcode: members[1].addressZipCode,
                    Country: "US",
                  },
                },
              ],
              Signers: [
                {
                  Name: "faraz",
                  Title: "Authorized Representative",
                  Signed: true,
                },
                {
                  Name: "anne",
                  Title: "Authorized Representative",
                  Signed: true,
                },
                {
                  Name: "mike",
                  Title: "Authorized Representative",
                  Signed: false,
                },
              ],
              ContactFirstName: formationFormData.contactFirstName,
              ContactLastName: formationFormData.contactLastName,
              ContactPhoneNumber: formationFormData.contactPhoneNumber,
            },
          },
          { headers: { "Content-Type": "text/plain" } }
        );
      });

      it("posts to the endpoint for a foreign user", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });
        const formationFormData = generateFormationFormData(
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            foreignDateOfFormation: "2022/10/20",
            foreignStateOfFormation: "Massachusetts",
            additionalProvisions: ["provision1", "provision2"],
            members: undefined,
            signers: [
              generateFormationSigner({
                name: "faraz",
                signature: true,
                title: "Authorized Representative",
              }),
              generateFormationSigner({
                name: "anne",
                signature: true,
                title: "General Partner",
              }),
              generateFormationSigner({
                name: "mike",
                signature: false,
                title: "Authorized Representative",
              }),
            ],
          },
          { legalStructureId: "foreign-limited-liability-company" }
        );

        const userData = generateFormationUserData(
          { legalStructureId: "limited-liability-company", businessPersona: "FOREIGN" },
          {},
          formationFormData
        );
        const currentBusiness = getCurrentBusiness(userData);

        await client.form(userData, "navigator.com/form-business");

        expect(mockAxios.post).toHaveBeenCalledWith(
          "example.com/formation/PrepareFiling",
          {
            Account: "12345",
            Key: "abcdef",
            ReturnUrl: "navigator.com/form-business?completeFiling=true",
            FailureReturnUrl: "navigator.com/form-business?completeFiling=false",
            Payer: {
              CompanyName: formationFormData.businessName,
              Address1: "",
              Address2: "",
              City: "",
              StateAbbreviation: undefined,
              ZipCode: "",
              Email: userData.user.email,
            },
            Formation: {
              Gov2GoAnnualReports: formationFormData.annualReportNotification,
              Gov2GoCorpWatch: formationFormData.corpWatchNotification,
              ShortGoodStanding: formationFormData.certificateOfStanding,
              Certified: formationFormData.certifiedCopyOfFormationDocument,
              PayerEmail: userData.user.email,
              SelectPaymentType: formationFormData.paymentType,
              BusinessInformation: {
                CompanyOrigin: "Foreign",
                Business: "ForeignLimitedLiabilityCompany",
                BusinessName: formationFormData.businessName,
                BusinessDesignator: formationFormData.businessSuffix,
                Naic: currentBusiness.profileData.naicsCode,
                BusinessPurpose: formationFormData.businessPurpose,
                EffectiveFilingDate: parseDateWithFormat(
                  formationFormData.businessStartDate,
                  defaultDateFormat
                ).format(formationApiDateFormat),
                ForeignDateOfFormation: "10/20/2022",
                ForeignStateOfFormation: "Massachusetts",
                MainAddress: {
                  Address1: formationFormData.addressLine1,
                  Address2: formationFormData.addressLine2,
                  City: formationFormData.addressCity,
                  State:
                    formationFormData.addressCountry === "US"
                      ? formationFormData.addressState?.name
                      : undefined,
                  Zipcode: formationFormData.addressZipCode,
                  Country: formationFormData.addressCountry,
                  Province:
                    formationFormData.addressCountry === "US" ? undefined : formationFormData.addressProvince,
                },
              },
              CompanyProfit: "Profit",
              RegisteredAgent: {
                Id: undefined,
                Email: formationFormData.agentEmail,
                Name: formationFormData.agentName,
                Location: {
                  Address1: formationFormData.agentOfficeAddressLine1,
                  Address2: formationFormData.agentOfficeAddressLine2,
                  City: formationFormData.agentOfficeAddressCity,
                  State: "New Jersey",
                  Zipcode: formationFormData.agentOfficeAddressZipCode,
                  Country: "US",
                },
              },
              Members: undefined,
              Signers: [
                {
                  Name: "faraz",
                  Title: "Authorized Representative",
                  Signed: true,
                },
                {
                  Name: "anne",
                  Title: "General Partner",
                  Signed: true,
                },
                {
                  Name: "mike",
                  Title: "Authorized Representative",
                  Signed: false,
                },
              ],
              ContactFirstName: formationFormData.contactFirstName,
              ContactLastName: formationFormData.contactLastName,
              ContactPhoneNumber: formationFormData.contactPhoneNumber,
            },
          },
          { headers: { "Content-Type": "text/plain" } }
        );
      });
    });

    describe("when CORP", () => {
      it("posts to the endpoint for a domestic user", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });
        const legalStructureId = randomInt() % 2 ? "s-corporation" : "c-corporation";
        const incorporators = [
          generateFormationIncorporator({
            name: "faraz",
            signature: true,
            title: "Incorporator",
            ...generateFormationNJAddress({}),
          }),
          generateFormationIncorporator({
            name: "anne",
            signature: false,
            title: "Incorporator",
            ...generateFormationUSAddress({}),
          }),
        ];

        const members = [
          generateFormationMember(generateFormationNJAddress({})),
          generateFormationMember(generateFormationUSAddress({})),
        ];

        const formationFormData = generateFormationFormData(
          {
            businessTotalStock: "1234",
            agentNumberOrManual: "MANUAL_ENTRY",
            additionalProvisions: ["provision1", "provision2"],
            incorporators,
            members,
          },

          { legalStructureId }
        );

        const userData = generateFormationUserData(
          { legalStructureId, businessPersona: "STARTING" },
          {},
          formationFormData
        );
        const currentBusiness = getCurrentBusiness(userData);

        await client.form(userData, "hostname.com/form-business");

        expect(mockAxios.post).toHaveBeenCalledWith(
          "example.com/formation/PrepareFiling",
          {
            Account: "12345",
            Key: "abcdef",
            ReturnUrl: "hostname.com/form-business?completeFiling=true",
            FailureReturnUrl: "hostname.com/form-business?completeFiling=false",
            Payer: {
              CompanyName: formationFormData.businessName,
              Address1: formationFormData.addressLine1,
              Address2: formationFormData.addressLine2,
              City: formationFormData.addressMunicipality?.name,
              StateAbbreviation: formationFormData.addressState?.shortCode,
              ZipCode: formationFormData.addressZipCode,
              Email: userData.user.email,
            },
            Formation: {
              Gov2GoAnnualReports: formationFormData.annualReportNotification,
              Gov2GoCorpWatch: formationFormData.corpWatchNotification,
              ShortGoodStanding: formationFormData.certificateOfStanding,
              Certified: formationFormData.certifiedCopyOfFormationDocument,
              PayerEmail: userData.user.email,
              SelectPaymentType: formationFormData.paymentType,
              BusinessInformation: {
                CompanyOrigin: "Domestic",
                Business: "DomesticForProfitCorporation",
                BusinessName: formationFormData.businessName,
                BusinessDesignator: formationFormData.businessSuffix,
                Naic: currentBusiness.profileData.naicsCode,
                TotalShares: 1234,
                BusinessPurpose: formationFormData.businessPurpose,
                EffectiveFilingDate: parseDateWithFormat(
                  formationFormData.businessStartDate,
                  defaultDateFormat
                ).format(formationApiDateFormat),
                MainAddress: {
                  Address1: formationFormData.addressLine1,
                  Address2: formationFormData.addressLine2,
                  City: formationFormData.addressMunicipality?.name,
                  State: "New Jersey",
                  Zipcode: formationFormData.addressZipCode,
                  Country: "US",
                },
              },
              AdditionalCCorpOrProfessionalCorp: {
                AdditionalProvisions: [{ Provision: "provision1" }, { Provision: "provision2" }],
              },
              CompanyProfit: "Profit",
              MemberAttestation: true,
              RegisteredAgent: {
                Id: undefined,
                Email: formationFormData.agentEmail,
                Name: formationFormData.agentName,
                Location: {
                  Address1: formationFormData.agentOfficeAddressLine1,
                  Address2: formationFormData.agentOfficeAddressLine2,
                  City: formationFormData.agentOfficeAddressCity,
                  State: "New Jersey",
                  Zipcode: formationFormData.agentOfficeAddressZipCode,
                  Country: "US",
                },
              },
              Members: [
                {
                  Name: members[0].name,
                  Location: {
                    Address1: members[0].addressLine1,
                    Address2: members[0].addressLine2,
                    City: members[0].addressMunicipality?.name,
                    State: "New Jersey",
                    Zipcode: members[0].addressZipCode,
                    Country: "US",
                  },
                },
                {
                  Name: members[1].name,
                  Location: {
                    Address1: members[1].addressLine1,
                    Address2: members[1].addressLine2,
                    City: members[1].addressCity,
                    State: members[1].addressState?.name,
                    Zipcode: members[1].addressZipCode,
                    Country: "US",
                  },
                },
              ],
              Incorporators: [
                {
                  Name: "faraz",
                  Location: {
                    Address1: incorporators[0].addressLine1,
                    Address2: incorporators[0].addressLine2,
                    City: incorporators[0].addressMunicipality?.name,
                    State: "New Jersey",
                    Zipcode: incorporators[0].addressZipCode,
                    Country: "US",
                  },
                },
                {
                  Name: "anne",
                  Location: {
                    Address1: incorporators[1].addressLine1,
                    Address2: incorporators[1].addressLine2,
                    City: incorporators[1].addressCity,
                    State: incorporators[1].addressState?.name,
                    Zipcode: incorporators[1].addressZipCode,
                    Country: "US",
                  },
                },
              ],
              Signers: [
                {
                  Name: "faraz",
                  Title: "Incorporator",
                  Signed: true,
                },
                {
                  Name: "anne",
                  Title: "Incorporator",
                  Signed: false,
                },
              ],
              ContactFirstName: formationFormData.contactFirstName,
              ContactLastName: formationFormData.contactLastName,
              ContactPhoneNumber: formationFormData.contactPhoneNumber,
            },
          },
          { headers: { "Content-Type": "text/plain" } }
        );
      });

      it("posts to the endpoint for a foreign user using text/plain", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });
        const legalStructureId = randomInt() % 2 ? "s-corporation" : "c-corporation";
        const signers = [
          generateFormationSigner({ name: "Faraz", title: "President", signature: true }),
          generateFormationSigner({ name: "Anne", title: "Vice-President", signature: true }),
          generateFormationSigner({
            name: "Mike",
            title: "Chairman of the Board",
            signature: true,
          }),
          generateFormationSigner({ name: "Dave", title: "CEO", signature: true }),
        ];
        const formationFormData = generateFormationFormData(
          {
            businessTotalStock: "1234",
            agentNumberOrManual: "MANUAL_ENTRY",
            foreignDateOfFormation: "2022/10/20",
            foreignStateOfFormation: "Massachusetts",
            additionalProvisions: undefined,
            members: undefined,
            incorporators: undefined,
            signers,
          },

          { legalStructureId: `foreign-${legalStructureId}` }
        );

        const userData = generateFormationUserData(
          { legalStructureId, businessPersona: "FOREIGN" },
          {},
          formationFormData
        );
        const currentBusiness = getCurrentBusiness(userData);

        const foreignGoodStandingFile = generateInputFile({});

        await client.form(userData, "hostname.com/form-business", foreignGoodStandingFile);

        expect(mockAxios.post).toHaveBeenCalledWith(
          "example.com/formation/PrepareFiling",
          {
            Account: "12345",
            Key: "abcdef",
            ReturnUrl: "hostname.com/form-business?completeFiling=true",
            FailureReturnUrl: "hostname.com/form-business?completeFiling=false",
            ForeignGoodStandingFile: {
              Extension: foreignGoodStandingFile.fileType,
              Content: foreignGoodStandingFile.base64Contents,
            },
            Payer: {
              CompanyName: formationFormData.businessName,
              Address1: "",
              Address2: "",
              City: "",
              StateAbbreviation: undefined,
              ZipCode: "",
              Email: userData.user.email,
            },
            Formation: {
              Gov2GoAnnualReports: formationFormData.annualReportNotification,
              Gov2GoCorpWatch: formationFormData.corpWatchNotification,
              ShortGoodStanding: formationFormData.certificateOfStanding,
              Certified: formationFormData.certifiedCopyOfFormationDocument,
              PayerEmail: userData.user.email,
              SelectPaymentType: formationFormData.paymentType,

              BusinessInformation: {
                CompanyOrigin: "Foreign",
                Business: "ForeignForProfitCorporation",
                BusinessName: formationFormData.businessName,
                BusinessDesignator: formationFormData.businessSuffix,
                Naic: currentBusiness.profileData.naicsCode,
                TotalShares: 1234,
                BusinessPurpose: formationFormData.businessPurpose,
                EffectiveFilingDate: parseDateWithFormat(
                  formationFormData.businessStartDate,
                  defaultDateFormat
                ).format(formationApiDateFormat),
                ForeignDateOfFormation: "10/20/2022",
                ForeignStateOfFormation: "Massachusetts",
                MainAddress: {
                  Address1: formationFormData.addressLine1,
                  Address2: formationFormData.addressLine2,
                  City: formationFormData.addressCity,
                  State:
                    formationFormData.addressCountry === "US"
                      ? formationFormData.addressState?.name
                      : undefined,
                  Zipcode: formationFormData.addressZipCode,
                  Country: formationFormData.addressCountry,
                  Province:
                    formationFormData.addressCountry === "US" ? undefined : formationFormData.addressProvince,
                },
              },
              CompanyProfit: "Profit",
              MemberAttestation: undefined,
              RegisteredAgent: {
                Id: undefined,
                Email: formationFormData.agentEmail,
                Name: formationFormData.agentName,
                Location: {
                  Address1: formationFormData.agentOfficeAddressLine1,
                  Address2: formationFormData.agentOfficeAddressLine2,
                  City: formationFormData.agentOfficeAddressCity,
                  State: "New Jersey",
                  Zipcode: formationFormData.agentOfficeAddressZipCode,
                  Country: "US",
                },
              },
              Members: undefined,
              Incorporators: undefined,
              Signers: [
                {
                  Name: "Faraz",
                  Title: "President",
                  Signed: true,
                },
                {
                  Name: "Anne",
                  Title: "Vice-President",
                  Signed: true,
                },
                {
                  Name: "Mike",
                  Title: "Chairman of the Board",
                  Signed: true,
                },
                {
                  Name: "Dave",
                  Title: "CEO",
                  Signed: true,
                },
              ],
              ContactFirstName: formationFormData.contactFirstName,
              ContactLastName: formationFormData.contactLastName,
              ContactPhoneNumber: formationFormData.contactPhoneNumber,
            },
          },
          { headers: { "Content-Type": "text/plain" } }
        );
      });

      describe("getPracticesLaw", () => {
        let stubResponse: ApiResponse;

        beforeEach(() => {
          jest.resetAllMocks();
          stubResponse = generateApiResponse({});
          mockAxios.post.mockResolvedValue({ data: stubResponse });
        });

        for (const legalStructureId of ["c-corporation", "s-corporation"]) {
          it("is undefined if not provided", async () => {
            const formationFormData = generateFormationFormData(
              {},
              { legalStructureId: `foreign-${legalStructureId}` as FormationLegalType }
            );

            const userData = generateFormationUserData(
              { legalStructureId, businessPersona: "FOREIGN" },
              {},
              formationFormData
            );

            await client.form(userData, "hostname.com/form-business");

            const payload = mockAxios.post.mock.calls[0][1] as ApiSubmission;
            expect(payload.Formation.BusinessInformation.PracticesLaw).toBe(undefined);
          });

          it("is 'Yes' if willPracticeLaw is true", async () => {
            const formationFormData = generateFormationFormData(
              { willPracticeLaw: true },
              { legalStructureId: `foreign-${legalStructureId}` as FormationLegalType }
            );

            const userData = generateFormationUserData(
              { legalStructureId, businessPersona: "FOREIGN" },
              {},
              formationFormData
            );

            await client.form(userData, "hostname.com/form-business");

            const payload = mockAxios.post.mock.calls[0][1] as ApiSubmission;
            expect(payload.Formation.BusinessInformation.PracticesLaw).toBe("Yes");
          });

          it("is 'No' if willPracticeLaw is false", async () => {
            const formationFormData = generateFormationFormData(
              { willPracticeLaw: false },
              { legalStructureId: `foreign-${legalStructureId}` as FormationLegalType }
            );

            const userData = generateFormationUserData(
              { legalStructureId, businessPersona: "FOREIGN" },
              {},
              formationFormData
            );

            await client.form(userData, "hostname.com/form-business");

            const payload = mockAxios.post.mock.calls[0][1] as ApiSubmission;
            expect(payload.Formation.BusinessInformation.PracticesLaw).toBe("No");
          });

          it("is undefined if not foreign corp", async () => {
            const formationFormData = generateFormationFormData(
              { willPracticeLaw: true },
              { legalStructureId: `${legalStructureId}` as FormationLegalType }
            );

            const userData = generateFormationUserData(
              { legalStructureId, businessPersona: "OWNING" },
              {},
              formationFormData
            );

            await client.form(userData, "hostname.com/form-business");

            const payload = mockAxios.post.mock.calls[0][1] as ApiSubmission;
            expect(payload.Formation.BusinessInformation.PracticesLaw).toBe(undefined);
          });
        }
      });
    });

    describe("when LLP", () => {
      it("posts to the endpoint for a domestic user", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });

        const formationFormData = generateFormationFormData(
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            additionalProvisions: ["provision1", "provision2"],
            members: [],
            signers: [
              generateFormationSigner({
                name: "faraz",
                signature: true,
                title: "Authorized Partner",
              }),
              generateFormationSigner({
                name: "anne",
                signature: true,
                title: "Authorized Partner",
              }),
              generateFormationSigner({
                name: "mike",
                signature: false,
                title: "Authorized Partner",
              }),
            ],
          },

          { legalStructureId: "limited-liability-partnership" }
        );

        const userData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              legalStructureId: "limited-liability-partnership",
              businessPersona: "STARTING",
            }),
            formationData: generateFormationData({ formationFormData }),
          })
        );

        await client.form(userData, "hostname.com/form-business");
        const currentBusiness = getCurrentBusiness(userData);

        expect(mockAxios.post).toHaveBeenCalledWith(
          "example.com/formation/PrepareFiling",
          {
            Account: "12345",
            Key: "abcdef",
            ReturnUrl: "hostname.com/form-business?completeFiling=true",
            FailureReturnUrl: "hostname.com/form-business?completeFiling=false",
            Payer: {
              CompanyName: formationFormData.businessName,
              Address1: formationFormData.addressLine1,
              Address2: formationFormData.addressLine2,
              City: formationFormData.addressMunicipality?.name,
              StateAbbreviation: "NJ",
              ZipCode: formationFormData.addressZipCode,
              Email: userData.user.email,
            },
            Formation: {
              Gov2GoAnnualReports: formationFormData.annualReportNotification,
              Gov2GoCorpWatch: formationFormData.corpWatchNotification,
              ShortGoodStanding: formationFormData.certificateOfStanding,
              Certified: formationFormData.certifiedCopyOfFormationDocument,
              PayerEmail: userData.user.email,
              SelectPaymentType: formationFormData.paymentType,
              BusinessInformation: {
                CompanyOrigin: "Domestic",
                Business: "DomesticLimitedLiabilityPartnership",
                BusinessName: formationFormData.businessName,
                BusinessDesignator: formationFormData.businessSuffix,
                Naic: currentBusiness.profileData.naicsCode,
                BusinessPurpose: formationFormData.businessPurpose,
                EffectiveFilingDate: parseDateWithFormat(
                  formationFormData.businessStartDate,
                  defaultDateFormat
                ).format(formationApiDateFormat),
                MainAddress: {
                  Address1: formationFormData.addressLine1,
                  Address2: formationFormData.addressLine2,
                  City: formationFormData.addressMunicipality?.name,
                  State: "New Jersey",
                  Zipcode: formationFormData.addressZipCode,
                  Country: "US",
                },
              },
              AdditionalLimitedLiabilityPartnership: {
                OtherProvisions: [{ Provision: "provision1" }, { Provision: "provision2" }],
              },
              CompanyProfit: "Profit",
              RegisteredAgent: {
                Id: undefined,
                Email: formationFormData.agentEmail,
                Name: formationFormData.agentName,
                Location: {
                  Address1: formationFormData.agentOfficeAddressLine1,
                  Address2: formationFormData.agentOfficeAddressLine2,
                  City: formationFormData.agentOfficeAddressCity,
                  State: "New Jersey",
                  Zipcode: formationFormData.agentOfficeAddressZipCode,
                  Country: "US",
                },
              },
              Members: [],
              Signers: [
                {
                  Name: "faraz",
                  Title: "Authorized Partner",
                  Signed: true,
                },
                {
                  Name: "anne",
                  Title: "Authorized Partner",
                  Signed: true,
                },
                {
                  Name: "mike",
                  Title: "Authorized Partner",
                  Signed: false,
                },
              ],
              ContactFirstName: formationFormData.contactFirstName,
              ContactLastName: formationFormData.contactLastName,
              ContactPhoneNumber: formationFormData.contactPhoneNumber,
            },
          },
          { headers: { "Content-Type": "text/plain" } }
        );
      });

      it("posts to the endpoint for a foreign user", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });

        const formationFormData = generateFormationFormData(
          {
            foreignDateOfFormation: "2022/10/20",
            foreignStateOfFormation: "Massachusetts",
            agentNumberOrManual: "MANUAL_ENTRY",
            additionalProvisions: [],
            members: undefined,
            signers: [
              generateFormationSigner({
                name: "faraz",
                title: "Authorized Representative",
                signature: true,
              }),
              generateFormationSigner({
                name: "anne",
                title: "General Partner",
                signature: true,
              }),
            ],
          },
          { legalStructureId: "foreign-limited-liability-partnership" }
        );

        const userData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              legalStructureId: "limited-liability-partnership",
              businessPersona: "FOREIGN",
            }),
            formationData: generateFormationData({ formationFormData }),
          })
        );
        const currentBusiness = getCurrentBusiness(userData);

        await client.form(userData, "hostname.com/form-business");

        expect(mockAxios.post).toHaveBeenCalledWith(
          "example.com/formation/PrepareFiling",
          {
            Account: "12345",
            Key: "abcdef",
            ReturnUrl: "hostname.com/form-business?completeFiling=true",
            FailureReturnUrl: "hostname.com/form-business?completeFiling=false",
            Payer: {
              CompanyName: formationFormData.businessName,
              Address1: "",
              Address2: "",
              City: "",
              StateAbbreviation: undefined,
              ZipCode: "",
              Email: userData.user.email,
            },
            Formation: {
              Gov2GoAnnualReports: formationFormData.annualReportNotification,
              Gov2GoCorpWatch: formationFormData.corpWatchNotification,
              ShortGoodStanding: formationFormData.certificateOfStanding,
              Certified: formationFormData.certifiedCopyOfFormationDocument,
              PayerEmail: userData.user.email,
              SelectPaymentType: formationFormData.paymentType,
              BusinessInformation: {
                CompanyOrigin: "Foreign",
                Business: "ForeignLimitedLiabilityPartnership",
                BusinessName: formationFormData.businessName,
                BusinessDesignator: formationFormData.businessSuffix,
                Naic: currentBusiness.profileData.naicsCode,
                BusinessPurpose: formationFormData.businessPurpose,
                EffectiveFilingDate: parseDateWithFormat(
                  formationFormData.businessStartDate,
                  defaultDateFormat
                ).format(formationApiDateFormat),
                ForeignDateOfFormation: "10/20/2022",
                ForeignStateOfFormation: "Massachusetts",
                MainAddress: {
                  Address1: formationFormData.addressLine1,
                  Address2: formationFormData.addressLine2,
                  City: formationFormData.addressCity,
                  State:
                    formationFormData.addressCountry === "US"
                      ? formationFormData.addressState?.name
                      : undefined,
                  Zipcode: formationFormData.addressZipCode,
                  Country: formationFormData.addressCountry,
                  Province:
                    formationFormData.addressCountry === "US" ? undefined : formationFormData.addressProvince,
                },
              },
              CompanyProfit: "Profit",
              RegisteredAgent: {
                Id: undefined,
                Email: formationFormData.agentEmail,
                Name: formationFormData.agentName,
                Location: {
                  Address1: formationFormData.agentOfficeAddressLine1,
                  Address2: formationFormData.agentOfficeAddressLine2,
                  City: formationFormData.agentOfficeAddressCity,
                  State: "New Jersey",
                  Zipcode: formationFormData.agentOfficeAddressZipCode,
                  Country: "US",
                },
              },
              Members: undefined,
              Signers: [
                {
                  Name: "faraz",
                  Title: "Authorized Representative",
                  Signed: true,
                },
                {
                  Name: "anne",
                  Title: "General Partner",
                  Signed: true,
                },
              ],
              ContactFirstName: formationFormData.contactFirstName,
              ContactLastName: formationFormData.contactLastName,
              ContactPhoneNumber: formationFormData.contactPhoneNumber,
            },
          },
          { headers: { "Content-Type": "text/plain" } }
        );
      });
    });

    describe("when LP", () => {
      it("posts to the endpoint with the api formation object", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });
        const incorporators = [
          generateFormationIncorporator({
            name: "faraz",
            signature: true,
            title: "General Partner",
            ...generateFormationNJAddress({}),
          }),
          generateFormationIncorporator({
            name: "anne",
            signature: true,
            title: "General Partner",
            ...generateFormationUSAddress({}),
          }),
          generateFormationIncorporator({
            name: "mike",
            signature: true,
            title: "General Partner",
            ...generateFormationUSAddress({}),
          }),
        ];
        const formationFormData = generateFormationFormData(
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            additionalProvisions: [],
            withdrawals: "withdrawl",
            dissolution: "dissolution",
            combinedInvestment: "combined investment",
            canCreateLimitedPartner: true,
            createLimitedPartnerTerms: "partner terms",
            canGetDistribution: true,
            getDistributionTerms: "get distro terms",
            canMakeDistribution: false,
            makeDistributionTerms: "make distro terms",
            members: undefined,
            signers: undefined,
            incorporators,
          },
          { legalStructureId: "limited-partnership" }
        );

        const userData = generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              legalStructureId: "limited-partnership",
              businessPersona: "STARTING",
            }),
            formationData: generateFormationData({ formationFormData }),
          })
        );
        const currentBusiness = getCurrentBusiness(userData);

        await client.form(userData, "hostname.com/form-business");

        expect(mockAxios.post).toHaveBeenCalledWith(
          "example.com/formation/PrepareFiling",
          {
            Account: "12345",
            Key: "abcdef",
            ReturnUrl: "hostname.com/form-business?completeFiling=true",
            FailureReturnUrl: "hostname.com/form-business?completeFiling=false",
            Payer: {
              CompanyName: formationFormData.businessName,
              Address1: formationFormData.addressLine1,
              Address2: formationFormData.addressLine2,
              City: formationFormData.addressMunicipality?.name,
              StateAbbreviation: "NJ",
              ZipCode: formationFormData.addressZipCode,
              Email: userData.user.email,
            },
            Formation: {
              Gov2GoAnnualReports: formationFormData.annualReportNotification,
              Gov2GoCorpWatch: formationFormData.corpWatchNotification,
              ShortGoodStanding: formationFormData.certificateOfStanding,
              Certified: formationFormData.certifiedCopyOfFormationDocument,
              PayerEmail: userData.user.email,
              SelectPaymentType: formationFormData.paymentType,
              BusinessInformation: {
                CompanyOrigin: "Domestic",
                Business: "DomesticLimitedPartnership",
                BusinessName: formationFormData.businessName,
                BusinessDesignator: formationFormData.businessSuffix,
                Naic: currentBusiness.profileData.naicsCode,
                BusinessPurpose: formationFormData.businessPurpose,
                EffectiveFilingDate: parseDateWithFormat(
                  formationFormData.businessStartDate,
                  defaultDateFormat
                ).format(formationApiDateFormat),
                MainAddress: {
                  Address1: formationFormData.addressLine1,
                  Address2: formationFormData.addressLine2,
                  City: formationFormData.addressMunicipality?.name,
                  State: "New Jersey",
                  Zipcode: formationFormData.addressZipCode,
                  Country: "US",
                },
              },
              AdditionalLimitedPartnership: {
                AdditionalProvisions: [],
                AggregateAmount: "combined investment",
                DissolutionPlan: "dissolution",
                GeneralPartnerWithdrawal: "withdrawl",
                LimitedCanCreateLimited: "Yes",
                LimitedCanCreateLimitedTerms: "partner terms",
                LimitedCanGetDistribution: "Yes",
                LimitedCanGetDistributionTerms: "get distro terms",
                LimitedCanMakeDistribution: "No",
                LimitedCanMakeDistributionTerms: "make distro terms",
              },
              CompanyProfit: "Profit",
              RegisteredAgent: {
                Id: undefined,
                Email: formationFormData.agentEmail,
                Name: formationFormData.agentName,
                Location: {
                  Address1: formationFormData.agentOfficeAddressLine1,
                  Address2: formationFormData.agentOfficeAddressLine2,
                  City: formationFormData.agentOfficeAddressCity,
                  State: "New Jersey",
                  Zipcode: formationFormData.agentOfficeAddressZipCode,
                  Country: "US",
                },
              },
              Members: [
                {
                  Name: incorporators[0].name,
                  Location: {
                    Address1: incorporators[0].addressLine1,
                    Address2: incorporators[0].addressLine2,
                    City: incorporators[0].addressMunicipality?.name,
                    State: "New Jersey",
                    Zipcode: incorporators[0].addressZipCode,
                    Country: "US",
                  },
                },
                {
                  Name: incorporators[1].name,
                  Location: {
                    Address1: incorporators[1].addressLine1,
                    Address2: incorporators[1].addressLine2,
                    City: incorporators[1].addressCity,
                    State: incorporators[1].addressState?.name,
                    Zipcode: incorporators[1].addressZipCode,
                    Country: "US",
                  },
                },
                {
                  Name: incorporators[2].name,
                  Location: {
                    Address1: incorporators[2].addressLine1,
                    Address2: incorporators[2].addressLine2,
                    City: incorporators[2].addressCity,
                    State: incorporators[2].addressState?.name,
                    Zipcode: incorporators[2].addressZipCode,
                    Country: "US",
                  },
                },
              ],
              Signers: [
                {
                  Name: incorporators[0].name,
                  Title: "General Partner",
                  Signed: true,
                },
                {
                  Name: incorporators[1].name,
                  Title: "General Partner",
                  Signed: true,
                },
                {
                  Name: incorporators[2].name,
                  Title: "General Partner",
                  Signed: true,
                },
              ],
              ContactFirstName: formationFormData.contactFirstName,
              ContactLastName: formationFormData.contactLastName,
              ContactPhoneNumber: formationFormData.contactPhoneNumber,
            },
          },
          { headers: { "Content-Type": "text/plain" } }
        );
      });
    });

    describe("when Nonprofit", () => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const getUserDataForNonProfit = (formationFormData: FormationFormData): UserData => {
        return generateUserDataForBusiness(
          generateBusiness({
            profileData: generateProfileData({
              legalStructureId: "nonprofit",
              businessPersona: "STARTING",
            }),
            formationData: generateFormationData({ formationFormData }),
          })
        );
      };

      it("posts to the endpoint with the api formation object when nonprofit provisions are IN_BYLAWS", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });
        const incorporators = [
          generateFormationIncorporator({
            name: "faraz",
            signature: true,
            title: "General Partner",
            ...generateFormationNJAddress({}),
          }),
        ];

        const members = [
          generateFormationMember({}),
          generateFormationMember({}),
          generateFormationMember({}),
        ];
        const formationFormData = generateFormationFormData(
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            hasNonprofitBoardMembers: true,
            nonprofitBoardMemberQualificationsSpecified: "IN_BYLAWS",
            nonprofitBoardMemberRightsSpecified: "IN_BYLAWS",
            nonprofitTrusteesMethodSpecified: "IN_BYLAWS",
            nonprofitAssetDistributionSpecified: "IN_BYLAWS",
            members,
            signers: undefined,
            incorporators,
            isVeteranNonprofit: false,
          },
          { legalStructureId: "nonprofit" }
        );

        const userData = getUserDataForNonProfit(formationFormData);
        const currentBusiness = getCurrentBusiness(userData);

        await client.form(userData, "hostname.com/form-business");

        expect(mockAxios.post).toHaveBeenCalledWith(
          "example.com/formation/PrepareFiling",
          {
            Account: "12345",
            Key: "abcdef",
            ReturnUrl: "hostname.com/form-business?completeFiling=true",
            FailureReturnUrl: "hostname.com/form-business?completeFiling=false",
            Payer: {
              CompanyName: formationFormData.businessName,
              Address1: formationFormData.addressLine1,
              Address2: formationFormData.addressLine2,
              City: formationFormData.addressMunicipality?.name,
              StateAbbreviation: "NJ",
              ZipCode: formationFormData.addressZipCode,
              Email: userData.user.email,
            },
            Formation: {
              Gov2GoAnnualReports: formationFormData.annualReportNotification,
              Gov2GoCorpWatch: formationFormData.corpWatchNotification,
              ShortGoodStanding: formationFormData.certificateOfStanding,
              Certified: formationFormData.certifiedCopyOfFormationDocument,
              PayerEmail: userData.user.email,
              SelectPaymentType: formationFormData.paymentType,
              BusinessInformation: {
                CompanyOrigin: "Domestic",
                Business: "DomesticNonProfitCorporation",
                BusinessName: formationFormData.businessName,
                BusinessDesignator: formationFormData.businessSuffix,
                Naic: currentBusiness.profileData.naicsCode,
                BusinessPurpose: formationFormData.businessPurpose,
                EffectiveFilingDate: parseDateWithFormat(
                  formationFormData.businessStartDate,
                  defaultDateFormat
                ).format(formationApiDateFormat),
                MainAddress: {
                  Address1: formationFormData.addressLine1,
                  Address2: formationFormData.addressLine2,
                  City: formationFormData.addressMunicipality?.name,
                  State: "New Jersey",
                  Zipcode: formationFormData.addressZipCode,
                  Country: "US",
                },
              },
              AdditionalDomesticNonProfitCorp: {
                HasMembers: "Yes",
                MemberTermsProvisionLocation: "Bylaw",
                MemberClassPermissionsProvisionLocation: "Bylaw",
                TrusteeElectionProcessProvisionLocation: "Bylaw",
                AssetDistributionProvisionLocation: "Bylaw",
              },
              CompanyProfit: "NonProfit",
              RegisteredAgent: {
                Id: undefined,
                Email: formationFormData.agentEmail,
                Name: formationFormData.agentName,
                Location: {
                  Address1: formationFormData.agentOfficeAddressLine1,
                  Address2: formationFormData.agentOfficeAddressLine2,
                  City: formationFormData.agentOfficeAddressCity,
                  State: "New Jersey",
                  Zipcode: formationFormData.agentOfficeAddressZipCode,
                  Country: "US",
                },
              },
              Members: [
                {
                  Name: members[0].name,
                  Location: {
                    Address1: members[0].addressLine1,
                    Address2: members[0].addressLine2,
                    City: members[0].addressCity,
                    State: members[0].addressState?.name,
                    Zipcode: members[0].addressZipCode,
                    Country: "US",
                  },
                },
                {
                  Name: members[1].name,
                  Location: {
                    Address1: members[1].addressLine1,
                    Address2: members[1].addressLine2,
                    City: members[1].addressCity,
                    State: members[1].addressState?.name,
                    Zipcode: members[1].addressZipCode,
                    Country: "US",
                  },
                },
                {
                  Name: members[2].name,
                  Location: {
                    Address1: members[2].addressLine1,
                    Address2: members[2].addressLine2,
                    City: members[2].addressCity,
                    State: members[2].addressState?.name,
                    Zipcode: members[2].addressZipCode,
                    Country: "US",
                  },
                },
              ],
              Signers: [
                {
                  Name: incorporators[0].name,
                  Title: "General Partner",
                  Signed: true,
                },
              ],
              ContactFirstName: formationFormData.contactFirstName,
              ContactLastName: formationFormData.contactLastName,
              ContactPhoneNumber: formationFormData.contactPhoneNumber,
            },
          },
          { headers: { "Content-Type": "text/plain" } }
        );
      });

      it("posts to the endpoint with nonprofit provisions when they are IN_FORM", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });
        const formationFormData = generateFormationFormData(
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            hasNonprofitBoardMembers: true,
            nonprofitBoardMemberQualificationsSpecified: "IN_FORM",
            nonprofitBoardMemberQualificationsTerms:
              "Board members should have at 1 year of industry experience.",
            nonprofitBoardMemberRightsSpecified: "IN_FORM",
            nonprofitBoardMemberRightsTerms: "Board members can serve up to 3 terms.",
            nonprofitTrusteesMethodSpecified: "IN_FORM",
            nonprofitTrusteesMethodTerms: "Trustees can serve up to 2 terms.",
            nonprofitAssetDistributionSpecified: "IN_FORM",
            nonprofitAssetDistributionTerms: "Asset distribution requires three signers.",
            members: [generateFormationMember({})],
            signers: undefined,
            incorporators: [generateFormationIncorporator({})],
            isVeteranNonprofit: false,
          },
          { legalStructureId: "nonprofit" }
        );

        const userData = getUserDataForNonProfit(formationFormData);
        await client.form(userData, "hostname.com/form-business");

        const lastIndex = mockAxios.post.mock.calls.length - 1;
        const lastSubmittedData = mockAxios.post.mock.calls[lastIndex][1] as ApiSubmission;

        expect(lastSubmittedData.Formation.BusinessInformation.Business).toEqual(
          "DomesticNonProfitCorporation"
        );

        expect(lastSubmittedData.Formation.AdditionalDomesticNonProfitCorp).toEqual({
          HasMembers: "Yes",
          MemberTermsProvisionLocation: "Herein",
          MemberTerms: "Board members should have at 1 year of industry experience.",
          MemberClassPermissionsProvisionLocation: "Herein",
          MemberClassPermissions: "Board members can serve up to 3 terms.",
          TrusteeElectionProcessProvisionLocation: "Herein",
          TrusteeElectionProcess: "Trustees can serve up to 2 terms.",
          AssetDistributionProvisionLocation: "Herein",
          AssetDistribution: "Asset distribution requires three signers.",
        });
      });

      it("posts to the endpoint with business as DomesticNonProfitVeteranCorporation when veteran-owned", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });

        const formationFormData = generateFormationFormData(
          {
            isVeteranNonprofit: true,
          },
          { legalStructureId: "nonprofit" }
        );

        const userData = getUserDataForNonProfit(formationFormData);

        await client.form(userData, "hostname.com/form-business");

        const lastIndex = mockAxios.post.mock.calls.length - 1;
        const lastSubmittedData = mockAxios.post.mock.calls[lastIndex][1] as ApiSubmission;

        expect(lastSubmittedData.Formation.BusinessInformation.Business).toEqual(
          "DomesticNonProfitVeteranCorporation"
        );
      });
    });

    it("fills only registered agent number when NUMBER is selected", async () => {
      const stubResponse = generateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const userData = generateFormationUserData({}, {}, { agentNumberOrManual: "NUMBER" });
      const currentBusiness = getCurrentBusiness(userData);

      await client.form(userData, "some-url");
      const postBody: ApiSubmission = mockAxios.post.mock.calls[0][1] as ApiSubmission;
      expect(postBody.Formation.RegisteredAgent.Id).toEqual(
        currentBusiness.formationData.formationFormData.agentNumber
      );
      expect(postBody.Formation.RegisteredAgent.Email).toEqual(undefined);
      expect(postBody.Formation.RegisteredAgent.Name).toEqual(undefined);
      expect(postBody.Formation.RegisteredAgent.Location).toEqual(undefined);
    });

    it("sends with empty NAICS code if profile data NAICS is not 6 digits", async () => {
      const stubResponse = generateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const userData = generateFormationUserData(
        { naicsCode: "12345" },
        {},
        { agentNumberOrManual: "NUMBER" }
      );

      await client.form(userData, "some-url");
      const postBody: ApiSubmission = mockAxios.post.mock.calls[0][1] as ApiSubmission;
      expect(postBody.Formation.BusinessInformation.Naic).toEqual("");
    });

    it("does not send business purpose if it is empty", async () => {
      const stubResponse = generateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const userData = generateFormationUserData({}, {}, { businessPurpose: "" });

      await client.form(userData, "some-url");
      const postBody: ApiSubmission = mockAxios.post.mock.calls[0][1] as ApiSubmission;
      expect(postBody.Formation.BusinessInformation.BusinessPurpose).toBeUndefined();
    });

    it("responds with success, token, and redirect url", async () => {
      const stubResponse = generateApiResponse({ Success: true });
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const userData = generateFormationUserData({}, {}, {});

      const response = await client.form(userData, "some-url");
      expect(response).toEqual({
        success: stubResponse.Success,
        token: stubResponse.PayUrl.PortalPayId,
        formationId: stubResponse.Id,
        redirect: stubResponse.PayUrl.RedirectToUrl,
        errors: [],
        lastUpdatedISO: expect.anything(),
      });
      expect(parseDate(response.lastUpdatedISO).isSame(getCurrentDate(), "minute")).toBe(true);
    });

    it("responds with error messages when failure", async () => {
      const stubError1 = generateApiError({ Name: "Formation.PayerEmail" });
      const stubError2 = generateApiError({ Name: "Formation.RegisteredAgent" });
      mockAxios.post.mockResolvedValue({ data: [stubError1, stubError2] });

      const userData = generateFormationUserData({}, {}, {});

      const response = await client.form(userData, "some-url");
      expect(response).toEqual({
        success: false,
        token: undefined,
        redirect: undefined,
        errors: [
          { field: "Payer Email", message: stubError1.ErrorMessage, type: "FIELD" },
          { field: "Registered Agent", message: stubError2.ErrorMessage, type: "FIELD" },
        ],
        lastUpdatedISO: expect.anything(),
      });
      expect(parseDate(response.lastUpdatedISO).isSame(getCurrentDate(), "minute")).toBe(true);
    });

    it("responds with generic response error when un-parseable failure", async () => {
      mockAxios.post.mockResolvedValue({
        data: "Unexpected error: An error occurred while updating the entries.",
      });

      const userData = generateFormationUserData({}, {}, {});

      const response = await client.form(userData, "some-url");
      expect(response).toEqual({
        success: false,
        token: undefined,
        redirect: undefined,
        errors: [{ field: "", message: "Response Error", type: "RESPONSE" }],
        lastUpdatedISO: expect.anything(),
      });
      expect(parseDate(response.lastUpdatedISO).isSame(getCurrentDate(), "minute")).toBe(true);
    });

    it("responds with generic error message when connection error", async () => {
      mockAxios.post.mockRejectedValue({});
      const userData = generateFormationUserData({}, {}, {});

      const response = await client.form(userData, "some-url");
      expect(response).toEqual({
        success: false,
        token: undefined,
        redirect: undefined,
        errors: [{ field: "", message: "Unknown Error", type: "UNKNOWN" }],
        lastUpdatedISO: expect.anything(),
      });
      expect(parseDate(response.lastUpdatedISO).isSame(getCurrentDate(), "minute")).toBe(true);
    });
  });

  describe("getCompletedFiling", () => {
    it("posts to the endpoint with formationId token", async () => {
      const stubResponse = stubGenerateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const response = await client.getCompletedFiling("formation-id-123");

      expect(mockAxios.post).toHaveBeenCalledWith("example.com/formation/GetCompletedFiling", {
        Account: "12345",
        Key: "abcdef",
        FormationId: "formation-id-123",
      });

      expect(response).toEqual({
        success: stubResponse.Success,
        entityId: stubResponse.EntityId,
        transactionDate: stubResponse.TransactionDate,
        confirmationNumber: stubResponse.ConfirmationNumber,
        formationDoc: stubResponse.FormationDoc,
        standingDoc: stubResponse.StandingDoc,
        certifiedDoc: stubResponse.CertifiedDoc,
      });
    });
  });

  describe("health check", () => {
    it("returns a passing health check if data can be retrieved sucessfully", async () => {
      const stubResponse = generateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });
      expect(await client.health()).toEqual({ success: true, data: { message: "OK" } });
    });

    it("returns a failing health check if unexpected data is retrieved", async () => {
      const stubResponse = generateApiResponse({ Success: false });
      mockAxios.post.mockResolvedValue({ data: stubResponse });
      expect(await client.health()).toEqual({
        error: {
          message: "Not Acceptable",
          timeout: false,
        },
        success: false,
      });
    });

    it("returns a failing health check if an unexpected status code is received", async () => {
      mockAxios.post.mockRejectedValue({ response: { status: 400 }, message: "" });
      expect(await client.health()).toEqual({
        success: false,
        error: {
          message: "Bad Gateway",
          serverResponseBody: "",
          serverResponseCode: 400,
          timeout: false,
        },
      });
    });

    it("returns a failing health check if axios request times out", async () => {
      mockAxios.post.mockRejectedValue({});
      expect(await client.health()).toEqual({
        success: false,
        error: {
          message: "Gateway Timeout",
          timeout: true,
        },
      });
    });
  });
});
