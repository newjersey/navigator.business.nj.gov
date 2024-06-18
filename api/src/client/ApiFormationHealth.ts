import { getCurrentDateInNewJerseyISOString, getCurrentDateISOString } from "@shared/dateHelpers";
import { OperatingPhaseId } from "@shared/operatingPhase";
import { CURRENT_VERSION, UserData } from "@shared/userData";

export const ApiFormationHealth: UserData = {
  version: CURRENT_VERSION,
  versionWhenCreated: -1,
  dateCreatedISO: "2024-02-09T19:16:27.974Z",
  lastUpdatedISO: "2024-02-09T19:16:27.974Z",
  user: {
    name: "testUser",
    email: "testuser@example.com",
    id: "test-user-id-17591518",
    externalStatus: {},
    receiveNewsletter: true,
    userTesting: true,
    abExperience: "ExperienceA",
    accountCreationSource: "test-source",
    contactSharingWithAccountCreationPartner: true,
  },
  currentBusinessId: "3145f251-6baa-4350-8b3d-a23761a15860",
  businesses: {
    "3145f251-6baa-4350-8b3d-a23761a15860": {
      id: "3145f251-6baa-4350-8b3d-a23761a15860",
      dateCreatedISO: getCurrentDateISOString(),

      onboardingFormProgress: "UNSTARTED",
      taskProgress: {},
      taskItemChecklist: {},
      licenseData: {
        nameAndAddress: {
          name: "some-name-42502490",
          addressLine1: "some-address-1-78700337",
          addressLine2: "some-address-2-98736596",
          zipCode: "some-zipcode-21305029",
        },
        completedSearch: false,
        items: [{ title: "some-title-23661305", status: "ACTIVE" }],
        status: "PENDING",
        lastUpdatedISO: getCurrentDateISOString(),
        expirationISO: getCurrentDateISOString(),
      },
      preferences: {
        roadmapOpenSections: ["PLAN", "START"],
        roadmapOpenSteps: [18013808],
        hiddenFundingIds: [],
        hiddenCertificationIds: [],
        visibleSidebarCards: [],
        returnToLink: "",
        isCalendarFullView: true,
        isHideableRoadmapOpen: true,
        phaseNewlyChanged: false,
      },
      taxFilingData: {
        filings: [
          { identifier: "some-identifier-15484222", dueDate: "2024-02-09", calendarEventType: "TAX-FILING" },
        ],
      },
      profileData: {
        liquorLicense: true,
        requiresCpa: false,
        homeBasedBusiness: false,
        plannedRenovationQuestion: undefined,
        cannabisLicenseType: "CONDITIONAL",
        cannabisMicrobusiness: true,
        constructionRenovationPlan: false,
        providesStaffingService: true,
        certifiedInteriorDesigner: false,
        realEstateAppraisalManagement: true,
        carService: "BOTH",
        interstateLogistics: false,
        interstateMoving: true,
        isChildcareForSixOrMore: true,
        petCareHousing: false,
        willSellPetCareItems: false,
        constructionType: undefined,
        residentialConstructionType: undefined,
        businessPersona: "FOREIGN",
        businessName: "some-business-name-17681628",
        responsibleOwnerName: "some-responsible-owner-name-69779144",
        tradeName: "some-trade-name-45860799",
        industryId: "daycare",
        legalStructureId: "limited-liability-company",
        municipality: {
          displayName: "some-display-name-69053282",
          name: "some-name-15347991",
          county: "some-county-64578920",
          id: "some-id-58645251",
        },
        dateOfFormation: "2024-02-09",
        entityId: "8206864808",
        employerId: "366451721",
        taxId: "752066817169",
        notes: "some-notes-81700319",
        ownershipTypeIds: [],
        documents: {
          certifiedDoc: "some-id-22001666/certifiedDoc-11742067.pdf",
          formationDoc: "some-id-22001666/formationDoc-30789275.pdf",
          standingDoc: "some-id-22001666/standingDoc-33598240.pdf",
        },
        existingEmployees: "1618552",
        taxPin: "2671",
        sectorId: "administrative-and-employment-services",
        naicsCode: "375127",
        foreignBusinessTypeIds: ["officeInNJ"],
        nexusDbaName: "",
        needsNexusDbaName: false,
        operatingPhase: OperatingPhaseId.NEEDS_TO_FORM,
        isNonprofitOnboardingRadio: false,
        nonEssentialRadioAnswers: {},
        encryptedTaxId: undefined,
        elevatorOwningBusiness: undefined,
      },
      formationData: {
        formationResponse: undefined,
        getFilingResponse: undefined,
        businessNameAvailability: undefined,
        dbaBusinessNameAvailability: undefined,
        formationFormData: {
          addressLine1: "some-address-1-12026889",
          addressLine2: "some-address-2-21252904",
          addressCity: "some-address-city-61207153",
          addressState: { shortCode: "TN", name: "Tennessee" },
          addressCountry: "US",
          businessLocationType: "US",
          addressZipCode: "23859",
          legalType: "foreign-limited-liability-company",
          businessName: "some-business-name-72304745",
          businessSuffix: "LLC",
          businessStartDate: getCurrentDateInNewJerseyISOString(),
          businessTotalStock: "",
          businessPurpose: "some-purpose-15247137",
          additionalProvisions: ["provision1", "provision2"],
          agentNumberOrManual: "MANUAL_ENTRY",
          agentNumber: "some-agent-number-33944625",
          agentName: "some-agent-name-52781191",
          agentEmail: "some-agent-email-28171869@gmail.com",
          agentOfficeAddressLine1: "agent-office-addr-1-94810479",
          agentOfficeAddressLine2: "agent-office-addr-2-93634915",
          agentOfficeAddressCity: "agent-city-31370791",
          agentOfficeAddressZipCode: "08146",
          agentUseAccountInfo: true,
          agentUseBusinessAddress: true,
          signers: [{ name: "test user", signature: true, title: "Authorized Representative" }],
          paymentType: "CC",
          annualReportNotification: false,
          corpWatchNotification: false,
          officialFormationDocument: false,
          certificateOfStanding: true,
          certifiedCopyOfFormationDocument: true,
          contactFirstName: "some-contact-first-name-15248752",
          contactLastName: "some-contact-last-name-97216646",
          contactPhoneNumber: "6092926748",
          withdrawals: "some-withdrawals-text-62080960",
          dissolution: "some-dissolution-text-69760616",
          combinedInvestment: "some-combinedInvestment-text-57158048",
          canCreateLimitedPartner: false,
          createLimitedPartnerTerms: "some-createLimitedPartnerTerms-text-15095464",
          canGetDistribution: true,
          getDistributionTerms: "some-getDistributionTerms-text-64337150",
          canMakeDistribution: true,
          makeDistributionTerms: "some-makeDistributionTerms-text-89515693",
          hasNonprofitBoardMembers: false,
          nonprofitBoardMemberQualificationsSpecified: "IN_BYLAWS",
          nonprofitBoardMemberQualificationsTerms:
            "some-nonprofitBoardMemberQualificationsTerms-text-92612643",
          nonprofitBoardMemberRightsSpecified: "IN_FORM",
          nonprofitBoardMemberRightsTerms: "some-nonprofitBoardMemberRightsTerms-text-24980832",
          nonprofitTrusteesMethodSpecified: "IN_FORM",
          nonprofitTrusteesMethodTerms: "some-nonprofitTrusteesMethodTerms-text-82042758",
          nonprofitAssetDistributionSpecified: "IN_BYLAWS",
          nonprofitAssetDistributionTerms: "some-nonprofitAssetDistributionTerms-text-26346580",
          foreignStateOfFormation: "Massachusetts",
          foreignDateOfFormation: "2022/10/20",
          members: undefined,
          incorporators: undefined,
          willPracticeLaw: false,
          isVeteranNonprofit: false,
        },
        completedFilingPayment: false,
        lastVisitedPageIndex: 0,
      },
      lastUpdatedISO: getCurrentDateISOString(),
    },
  },
};
