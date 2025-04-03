const variable = {
  userId: "7a321ec4-0cb7-4e0a-9527-4560356fca52",
  data: {
    businesses: {
      "aeae0ec1-230d-41a2-9cef-6fd4624a7f45": {
        userId: "7a321ec4-0cb7-4e0a-9527-4560356fca52",
        dateCreatedISO: "2025-04-01T22:15:54.410Z",
        formationData: {
          completedFilingPayment: false,
          formationFormData: {
            addressLine1: "",
            addressLine2: "",
            addressZipCode: "",
            agentEmail: "",
            agentName: "",
            agentNumber: "",
            agentNumberOrManual: "NUMBER",
            agentOfficeAddressCity: "",
            agentOfficeAddressLine1: "",
            agentOfficeAddressLine2: "",
            agentOfficeAddressZipCode: "",
            agentUseAccountInfo: false,
            agentUseBusinessAddress: false,
            annualReportNotification: true,
            businessLocationType: "NJ",
            businessName: "",
            businessPurpose: "",
            businessStartDate: "2025-04-02",
            businessTotalStock: "",
            certificateOfStanding: false,
            certifiedCopyOfFormationDocument: false,
            combinedInvestment: "",
            contactFirstName: "Aaron",
            contactLastName: "Didner",
            contactPhoneNumber: "",
            corpWatchNotification: true,
            createLimitedPartnerTerms: "",
            dissolution: "",
            getDistributionTerms: "",
            legalType: "limited-liability-company",
            makeDistributionTerms: "",
            nonprofitAssetDistributionTerms: "",
            nonprofitBoardMemberQualificationsTerms: "",
            nonprofitBoardMemberRightsTerms: "",
            nonprofitTrusteesMethodTerms: "",
            officialFormationDocument: true,
            willPracticeLaw: false,
            withdrawals: "",
          },
          lastVisitedPageIndex: 0,
        },
        id: "aeae0ec1-230d-41a2-9cef-6fd4624a7f45",
        lastUpdatedISO: "2025-04-02T19:42:18.470Z",
        onboardingFormProgress: "COMPLETED",
        preferences: {
          hiddenCertificationIds: [],
          hiddenFundingIds: [],
          isCalendarFullView: false,
          isHideableRoadmapOpen: false,
          phaseNewlyChanged: false,
          returnToLink: "",
          roadmapOpenSections: ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"],
          roadmapOpenSteps: [1, 3, 2],
          visibleSidebarCards: ["go-to-profile", "funding-nudge"],
        },
        profileData: {
          businessName: "",
          businessPersona: "STARTING",
          certifiedInteriorDesigner: false,
          dateOfFormation: "2025-02-01",
          documents: {
            certifiedDoc: "",
            formationDoc: "",
            standingDoc: "",
          },
          foreignBusinessTypeIds: [],
          industryId: "generic",
          interstateLogistics: false,
          interstateMoving: false,
          legalStructureId: "limited-liability-company",
          liquorLicense: false,
          municipality: {
            county: "Monmouth",
            displayName: "Allenhurst",
            id: "recN1h8ItsA5lzkps",
            name: "Allenhurst",
          },
          naicsCode: "",
          nexusDbaName: "",
          nonEssentialRadioAnswers: {},
          notes: "",
          operatingPhase: "FORMED",
          ownershipTypeIds: [],
          providesStaffingService: false,
          realEstateAppraisalManagement: false,
          requiresCpa: false,
          responsibleOwnerName: "",
          sectorId: "other-services",
          tradeName: "",
        },
        taskItemChecklist: {},
        taskProgress: {
          "business-structure": "COMPLETED",
          "form-business-entity": "COMPLETED",
        },
        taxClearanceCertificateData: {
          addressCity: "",
          addressLine1: "",
          addressLine2: "",
          addressZipCode: "",
          businessName: "",
          entityId: "",
          requestingAgencyId: "",
          taxId: "",
          taxPin: "",
        },
        taxFilingData: {
          filings: [
            {
              calendarEventType: "TAX-FILING",
              dueDate: "2026-02-28",
              identifier: "ANNUAL_FILING",
            },
            {
              calendarEventType: "TAX-FILING",
              dueDate: "2027-02-28",
              identifier: "ANNUAL_FILING",
            },
            {
              calendarEventType: "TAX-FILING",
              dueDate: "2028-02-28",
              identifier: "ANNUAL_FILING",
            },
          ],
        },
        version: 158,
        versionWhenCreated: 158,
      },
    },
    currentBusinessId: "aeae0ec1-230d-41a2-9cef-6fd4624a7f45",
    dateCreatedISO: "2025-04-01T22:16:28.452Z",
    lastUpdatedISO: "2025-04-02T19:42:18.470Z",
    user: {
      abExperience: "ExperienceA",
      accountCreationSource: "",
      contactSharingWithAccountCreationPartner: true,
      email: "adidner@gmail.com",
      externalStatus: {
        newsletter: {
          status: "SUCCESS",
          success: true,
        },
        userTesting: {
          status: "RESPONSE_ERROR",
          success: false,
        },
      },
      id: "7a321ec4-0cb7-4e0a-9527-4560356fca52",
      intercomHash:
        "44437f850026b61eb969bb02c9a395b40891bca35757f5e55c2db8194f7c86fb",
      myNJUserKey: "143162",
      name: "Aaron Didner",
      receiveNewsletter: true,
      userTesting: true,
    },
    version: 158,
    versionWhenCreated: 158,
  },
  email: "adidner@gmail.com",
  version: 158,
};

//  Inputs
variable.data.businesses["4e465178-24b8-4f4a-a809-2bc48906a47e"].profileData
  .dateOfFormation; // needs to look at the last 6 months in batches of 4
variable.data.businesses["4e465178-24b8-4f4a-a809-2bc48906a47e"].profileData
  .businessPersona == "STARTING";
variable.data.user.userTesting == true;

//  Outputs
variable.data.user.email;
variable.data.user.name;
variable.data.businesses["4e465178-24b8-4f4a-a809-2bc48906a47e"].profileData
  .businessName;
variable.data.businesses["4e465178-24b8-4f4a-a809-2bc48906a47e"].profileData
  .dateOfFormation;

/*
aws dynamodb scan \
  --table-name YourTableName \
  --filter-expression "contains(#businesses, :business) AND #userTesting = :userTesting AND #formationFormData >= :sixMonthsAgo" \
  --expression-attribute-names '{"#businesses": "variable.data.businesses", "#userTesting": "variable.data.user.userTesting", "#formationFormData": "formationFormData"}' \
  --expression-attribute-values '{":business": {"M": {"profileData": {"M": {"businessPersona": {"S": "STARTING"}}}}}, ":userTesting": {"BOOL": true}, ":sixMonthsAgo": {"N": "20230401"}}'
*/
