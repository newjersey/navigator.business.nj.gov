/**
 * Default configuration object with safe fallback values
 * This ensures getMergedConfig() always returns a valid ConfigType
 * even during SSG when JSON imports may not be fully loaded
 */
export const getDefaultConfig = (): Record<string, unknown> => ({
  // Add comprehensive defaults for all config properties
  // These will be overridden by actual config values when available
  legalMessageDefaults: {
    legalMessageTextOne: "",
    legalMessageLegalChat: "",
    legalMessageTextTwo: "",
  },
  profileDefaults: {
    default: {
      essentialQuestionAlertText: "",
      errorDefaultTextBody: "",
      errorTextHeader: "",
      lockedFieldTooltipText: "",
      contactInformationSubText: "",
      annualReportDeadlineSubText: "",
      secondaryNavigationAriaLabel: "",
      profileTabContactTitle: "",
      filterCertificationsAndFundingHeader: "",
      profileTabPersonalizeYourTasksTitle: "",
      notificationProductNewsDescription: "",
      backButtonText: "",
      errorTextEmail: "",
      typesOfNotificationsHeading: "",
      profileAddressNotProvided: "",
      profileTabPermitsTitle: "",
      escapeModalEscape: "",
      escapeModalBody: "",
      escapeModalQuestion: "",
      escapeModalSaveChanges: "",
      notificationIncompleteTasksLabel: "",
      notificationNewsletterLabel: "",
      standingDocFileTitle: "",
      errorErrorAlertOneField: "",
      securityMattersHeading: "",
      profileTabDocsTitle: "",
      profilePageTitlePrefix: "",
      successTextBody: "",
      typesOfNotificationsSubText: "",
      formationDocFileTitle: "",
      filterCertificationsAndFundingSubText: "",
      contactInformationHeading: "",
      notificationIncompleteTasksDescription: "",
      errorTextBody: "",
      notificationNewsletterDescription: "",
      yourProfileHelpsWithRecommendationsCallout: "",
      annualReportDeadlineHeader: "",
      escapeModalHeader: "",
      profileTabNumbersTitle: "",
      profileTabNoteTitle: "",
      locationBasedRequirementsHeader: "",
      saveButtonText: "",
      contactAndNotificationsSubText: "",
      permitsAndLicensesSubText: "",
      escapeModalReturn: "",
      errorAlertMultipleFields: "",
      successTextHeader: "",
      notificationProductNewsLabel: "",
      cannabisLocationAlert: "",
      certificationDocFileTitle: "",
      profileTabInfoTitle: "",
      securityMattersText: "",
      locationBasedRequirementsSubText: "",
      profileTabSlugs: {
        info: "",
        contact: "",
        permits: "",
        numbers: "",
        documents: "",
        notes: "",
        personalize: "",
      },
    },
    fields: {
      carService: {
        default: {
          header: "",
          radioButtonStandardText: "",
          radioButtonHighCapacityText: "",
          radioButtonBothText: "",
          description: "",
        },
      },
      notes: {
        default: {
          header: "",
          description: "",
        },
      },
      providesStaffingService: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      sectorId: {
        default: {
          header: "",
          description: "",
          errorTextRequired: "",
        },
        onboarding: {
          default: {
            description: "",
          },
          overrides: {
            OWNING: {
              description: "",
            },
          },
        },
      },
      certifiedInteriorDesigner: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      interstateMoving: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      carnivalRideOwningBusiness: {
        default: {
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      taxId: {
        default: {
          header: "",
          headerContextualInfo: "",
          description: "",
          errorTextRequired: "",
          disclaimerMd: "",
        },
      },
      requiresCpa: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      responsibleOwnerName: {
        default: {
          header: "",
          errorTextRequired: "",
          description: "",
        },
      },
      nexusBusinessName: {
        default: {
          editButton: "",
          addButton: "",
          outOfStateNameHeader: "",
          emptyBusinessPlaceHolder: "",
        },
      },
      foreignBusinessTypeIds: {
        default: {
          header: "",
          description: "",
          errorTextRequired: "",
          optionContent: {
            employeeOrContractorInNJ: "",
            officeInNJ: "",
            propertyInNJ: "",
            companyOperatedVehiclesInNJ: "",
            employeesInNJ: "",
            transactionsInNJ: "",
            revenueInNJ: "",
            none: "",
          },
          REMOTE_WORKER: "",
          REMOTE_SELLER: "",
          NEXUS: "",
        },
      },
      taxPin: {
        default: {
          header: "",
          headerContextualInfo: "",
          errorTextRequired: "",
          description: "",
          showButtonText: "",
          hideButtonText: "",
          showButtonTextMobile: "",
          hideButtonTextMobile: "",
        },
      },
      deptOfLaborEin: {
        default: {
          showButtonText: "",
          hideButtonText: "",
        },
      },
      elevatorOwningBusiness: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
          altDescription: "",
        },
      },
      businessName: {
        default: {
          header: "",
          headerContextualInfo: "",
          description: "",
        },
      },
      constructionType: {
        default: {
          header: "",
          radioButtonResidentialText: "",
          radioButtonCommercialOrIndustrialText: "",
          radioButtonBothText: "",
          description: "",
        },
      },
      dateOfFormation: {
        default: {
          header: "",
          headerContextualInfo: "",
          headerNotBolded: "",
          description: "",
          errorTextRequired: "",
        },
      },
      nonEssentialQuestions: {
        default: {
          linkToPermitsTextBeforeButton: "",
          linkToPermitsTextButton: "",
          radioButtonFalseText: "",
          sectionSubText: "",
          radioButtonTrueText: "",
          optionalText: "",
          linkToPermitsHeader: "",
          sectionHeader: "",
          linkToPermitsTextAfterButton: "",
        },
      },
      businessPersona: {
        default: {
          header: "",
          radioButtonStartingText: "",
          radioButtonOwningText: "",
          radioButtonForeignText: "",
          errorTextRequired: "",
          description: "",
        },
      },
      petCareHousing: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      travelingCircusOrCarnivalOwningBusiness: {
        default: {
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      publicWorksContractor: {
        default: {
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      tradeName: {
        default: {
          header: "",
          errorTextRequired: "",
        },
      },
      vacantPropertyOwner: {
        default: {
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      ownershipTypeIds: {
        default: {
          header: "",
          description: "",
          headerNotBolded: "",
        },
        overrides: {
          OWNING: {
            header: "",
            headerNotBolded: "",
          },
        },
      },
      residentialConstructionType: {
        default: {
          header: "",
          radioButtonNewHomeConstructionText: "",
          radioButtonHomeRenovationsText: "",
          radioButtonBothText: "",
          description: "",
        },
      },
      hasThreeOrMoreRentalUnits: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      nexusDbaName: {
        default: {
          header: "",
          headerContextualInfo: "",
          description: "",
          errorTextRequired: "",
        },
      },
      employmentAgency: {
        default: {
          header: "",
          description: "",
        },
      },
      cannabisLicenseType: {
        default: {
          header: "",
          description: "",
          radioButtonAnnualText: "",
          radioButtonConditionalText: "",
        },
      },
      naicsCode: {
        default: {
          header: "",
          headerContextualInfo: "",
          editText: "",
          addText: "",
          notEnteredText: "",
          altDescription: "",
        },
      },
      employmentPlacementType: {
        default: {
          header: "",
          radioButtonTemporaryText: "",
          radioButtonPermanentText: "",
          radioButtonBothText: "",
          description: "",
        },
      },
      businessAddress: {
        default: {
          header: "",
          usAddress: "",
          intlAddress: "",
        },
      },
      isChildcareForSixOrMore: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      homeContractor: {
        default: {
          header: "",
          description: "",
        },
      },
      willSellPetCareItems: {
        default: {
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      homeBasedBusiness: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
          altDescription: "",
        },
      },
      legalStructureId: {
        default: {
          header: "",
          headerContextualInfo: "",
          description: "",
          errorTextRequired: "",
          editText: "",
          addText: "",
          notEnteredText: "",
          optionContent: {
            "general-partnership": "",
            "c-corporation": "",
            "limited-liability-company": "",
            "limited-liability-partnership": "",
            "limited-partnership": "",
            "s-corporation": "",
            "sole-proprietorship": "",
            nonprofit: "",
          },
        },
      },
      employerId: {
        default: {
          header: "",
          headerContextualInfo: "",
          headerNotBolded: "",
          description: "",
        },
      },
      documents: {
        default: {
          header: "",
          placeholder: "",
        },
      },
      industryId: {
        default: {
          header: "",
          headerContextualInfo: "",
          description: "",
          errorTextRequired: "",
          searchAffirmation: "",
        },
        onboarding: {
          default: {
            description: "",
          },
        },
      },
      existingEmployees: {
        default: {
          header: "",
          description: "",
        },
        overrides: {
          OWNING: {
            header: "",
            description: "",
          },
        },
      },
      raffleBingoGames: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
          altDescription: "",
        },
      },
      employmentPersonnelServiceType: {
        default: {
          header: "",
          radioButtonJobSeekersText: "",
          radioButtonEmployersText: "",
          description: "",
        },
      },
      municipality: {
        default: {
          header: "",
          description: "",
          errorTextRequired: "",
        },
        overrides: {
          OWNING: {
            description: "",
          },
          FOREIGN: {
            description: "",
          },
        },
      },
      liquorLicense: {
        default: {
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          header: "",
          description: "",
        },
      },
      plannedRenovationQuestion: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          altDescription: "",
          description: "",
        },
      },
      entityId: {
        default: {
          header: "",
          headerContextualInfo: "",
          description: "",
        },
      },
      interstateLogistics: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      realEstateAppraisalManagement: {
        default: {
          header: "",
          radioButtonTrueText: "",
          radioButtonFalseText: "",
          description: "",
        },
      },
      propertyLeaseType: {
        default: {
          header: "",
          radioButtonShortTermRentalText: "",
          radioButtonLongTermRentalText: "",
          radioButtonBothText: "",
          description: "",
        },
      },
    } as unknown,
  },
  filingDefaults: {
    issuingAgencyText: "",
    onlineTaxFilingMethod: "",
    paperOrMailOnlyTaxFilingMethod: "",
    onlineRequiredTaxFilingMethod: "",
    onlineOrPhoneTaxFilingMethod: "",
    beforeDueDateText: "",
    dueDateToolTip: "",
    extensionTagText: "",
    treasuryLinkText: "",
    taxRateTitle: "",
    filingMethod: "",
    filingFrequency: "",
    lateFilingsTitle: "",
    lateFilingsMarkdown: "",
    conditionalHeadingDefaultText: "",
    additionalInfo: "",
    formText: "",
  },
  fundingDefaults: {
    issuingAgencyText: "",
  },
  taskDefaults: {
    backToRoadmapText: "",
    secondaryNavigationAriaLabel: "",
    issuingAgencyText: "",
    defaultCallToActionText: "",
  },
  navigationDefaults: {
    navBarGuestBusinessText: "",
    navBarMyAccountText: "",
    navBarGuestAccountText: "",
    navBarBusinessNJGovAltText: "",
    navBarBusinessNJGovAriaLabel: "",
    navBarUnnamedDbaBusinessText: "",
    navBarUnnamedOwnedBusinessText: "",
    navBarUnnamedForeignRemoteSellerWorkerText: "",
    navBarBusinessNJGovLink: "",
    navBarUnnamedBusinessText: "",
    logInButton: "",
    logoutButton: "",
    navBarGuestRegistrationText: "",
    landingPageDropDownTitle: "",
    profileLinkText: "",
    backToProfileLinkText: "",
    removeBusinessLinkText: "",
    myNJAccountText: "",
    addBusinessButton: "",
    getStartedText: "",
  },
  navigationQuickLinks: {
    navBarPlanText: "",
    navBarPlanLink: "",
    navBarStartText: "",
    navBarStartLink: "",
    navBarOperateText: "",
    navBarOperateLink: "",
    navBarGrowText: "",
    navBarGrowLink: "",
    navBarUpdatesText: "",
    navBarUpdatesLink: "",
    navBarSearchText: "",
    navBarSearchLink: "",
    navBarMobileQuickLinksTitle: "",
  },
  betaBar: {
    betaMainText: "",
    betaModalButtonText: "",
  },
  footer: {
    linkOne: "",
    linkOneText: "",
    linkTwo: "",
    linkTwoText: "",
    officeLink: "",
    madeWithLoveByTheOfficeOfInnovationAriaLabel: "",
    madeWithText: "",
    byTheOfficeOfInnovationText: "",
    creditText: "",
    creditLink: "",
    creditLinkText: "",
    officeExternalText: "",
    gitHubLink: "",
    facebookLink: "",
  },
  skipToMainContent: {
    buttonText: "",
  },
  businessStructurePrompt: {
    buttonText: "",
  },
  formation: {
    interimSuccessPage: {
      alertText: "",
      bodyText: "",
      buttonText: "",
      modalTitle: "",
      modalCancel: "",
      modalContinue: "",
      modalBody: "",
    } as unknown,
    fields: {
      addressLine1: { label: "", error: "" },
      addressLine2: { label: "" },
      addressCity: { label: "", error: "" },
      addressState: { label: "", error: "" },
      addressZipCode: { label: "", error: "", foreign: { label: "", errorUS: "", errorIntl: "" } },
      addressProvince: { label: "", error: "" },
      addressCountry: { label: "", error: "" },
      addressMunicipality: { error: "" },
      foreignGoodStandingFile: { errorMessageFileSize: "", errorMessageFileType: "" },
      paymentType: { serviceColumnLabel: "", costColumnLabel: "" },
    } as unknown,
  },
  envQuestionPage: {
    generic: {
      startingButtonText: "",
      endingButtonText: "",
      buttonText: "",
      backButtonText: "",
      question: "",
      footerText: "",
      errorText: "",
      title: "",
      ariaContextEnvStepperLabels: "",
      ariaContextInlineDialogActive: "",
      ariaContextInlineDialogInactive: "",
    } as unknown,
  },
  starterKits: {
    hero: {
      title: "",
      subtitle: "",
      ctaButton: "",
    },
    solutions: {
      title: "",
      subtitle: "",
      ctaButton: "",
      card1: { title: "", body: "" },
      card2: { title: "", body: "" },
      card3: { title: "", body: "" },
    },
    steps: {
      title: "",
      ctaButton: "",
    },
    seo: {
      description: "",
      imageAltText: "",
    },
  },
  loginSupportPage: {
    logoutButtonText: "",
    supportCallout: { buttonText: "" },
  } as unknown,
  formationDateDeletionModal: {
    header: "",
    deleteButtonText: "",
    cancelButtonText: "",
    description: "",
    areYouSureModalBody: "",
  },
  formationDateModal: {
    header: "",
    saveButtonText: "",
    cancelButtonText: "",
    description: "",
    fieldLabel: "",
    fieldDescription: "",
    dateOfFormationErrorText: "",
  },
  removeBusinessModal: {
    header: "",
    cancelButtonText: "",
    removeBusinessButtonText: "",
    agreementCheckboxErrorText: "",
    filingOfficialBusinessClosureText: "",
    businessRemovalText: "",
    irreversibleOperationText: "",
    agreementCheckboxText: "",
  },
  selfRegistration: {
    needsAccountModalTitle: "",
    needsAccountModalBody: "",
    needsAccountModalButtonText: "",
    continueWithoutSaving: "",
    needsAccountModalSubText: "",
    accountSuccessSnackbarBody: "",
    accountSuccessSnackbarTitle: "",
    accountSuccessSnackbarTitleExistingAccount: "",
    errorTextDuplicateSignUp: "",
    errorTextGeneric: "",
    errorTextEmailsNotMatching: "",
    nameFieldLabel: "",
    investNewarkContactSharingCheckboxLabel: "",
    userTestingCheckboxLabel: "",
    signUpTitleText: "",
    errorTextRequiredFields: "",
    errorTextFullName: "",
    errorTextFullNameLength: "",
    emailFieldLabel: "",
    confirmEmailFieldLabel: "",
    phoneNumberFieldLabel: "",
    phoneNumberFieldLabelOptional: "",
    errorTextPhoneNumber: "",
    submitButtonText: "",
    closeButtonText: "",
    updatesAndRemindersCheckboxLabel: "",
    newsletterCheckboxLabel: "",
    errorTextFullNameSpecialCharacter: "",
    errorTextFullNameStartWithLetter: "",
  },
  anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults: {
    licenseExpirationHeaderText: "",
  },
  calloutDefaults: {
    informationalHeadingDefaultText: "",
    quickReferenceHeadingDefaultText: "",
    conditionalHeadingDefaultText: "",
    warningHeadingDefaultText: "",
    phoneIconAriaLabel: "",
    emailIconAriaLabel: "",
  },
  calloutAlerts: {
    info: "",
    success: "",
    warning: "",
    error: "",
    note: "",
    calloutAlertGroupTitle: "",
  },
  unsupportedNavigatorUserPage: {
    title: "",
    subtitle: "",
  },
  landingPage: {
    card1Header: "",
    card1SupportingText: "",
    card1ButtonLink: "",
    card1Button: "",
    card2Header: "",
    card2SupportingText: "",
    card2ButtonLink: "",
    card2Button: "",
    card3Header: "",
    card3SupportingText: "",
    card3Button: "",
  },
  pageNotFoundError: {
    errorHeader: "",
    errorDescriptionPt1: "",
    errorDescriptionPt2: "",
    errorChatWithExpert: "",
  },
  pagesMetadata: {
    titlePostfix: "",
    homeTitle: "",
    siteDescription: "",
    dashboardTitle: "",
    profileTitle: "",
    featureFlagsTitle: "",
    deadLinksTitle: "",
    deadUrlsTitle: "",
    notesMd: "",
  },
  fundingsOnboardingModal: {
    pageHeader: {
      buttonText: "",
    },
  },
  passengerTransportCdlTabTwo: {
    infoAccordionHeaderWithSText: "",
    infoAccordionHeaderWithoutSText: "",
    issuingAgencyText: "",
  },
  cigaretteLicenseShared: {
    issuingAgencyText: "",
  },
  taxClearanceCertificateStep1: {
    issuingAgencyText: "",
  },
  xrayRegistrationTask: {
    issuingAgencyText: "",
  },
  abcEmergencyTripPermit: {
    fields: {} as unknown,
  },
  determineNaicsCode: {
    naicsLink: "",
    successMessage: "",
    invalidValidationErrorText: "",
    missingNAICSCodePlaceholder: "",
    hasSavedCodeHeader: "",
    findCodeHeader: "",
    findCodeBodyText: "",
    lengthValidationErrorText: "",
    ariaLabelText: "",
    naicsDescriptionURL: "",
    saveButtonText: "",
    suggestedCodeBodyText: "",
  },
  accountSetup: {
    default: {
      header: "",
      body: "",
      submitButton: "",
    },
    existingAccount: {
      header: "",
      body: "",
      submitButton: "",
    },
    errorAlert: "",
  },
  siteWideErrorMessages: {
    errorTextNoData: "",
    errorTextCachedOnly: "",
    errorTextUpdateFailed: "",
    errorRadioButton: "",
    errorScreenReaderInlinePrefix: "",
  },
});
