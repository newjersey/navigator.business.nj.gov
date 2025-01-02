/* eslint-disable jest/expect-expect */
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { ROUTES } from "@/lib/domain-logic/routes";
import { templateEval } from "@/lib/utils/helpers";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentBusiness,
  currentUserData,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  defaultDateFormat,
  emptyAddressData,
  generateFormationData,
  generateFormationFormData,
  generateMunicipality,
  generateProfileData,
  getCurrentDate,
  LookupOwnershipTypeById,
  LookupSectorTypeById,
  randomInt,
} from "@businessnjgovnavigator/shared";
import { generateTaxFilingData, randomLegalStructure } from "@businessnjgovnavigator/shared/test";

import analytics from "@/lib/utils/analytics";
import {
  BUSINESS_ADDRESS_LINE_1_MAX_CHAR,
  BUSINESS_ADDRESS_LINE_2_MAX_CHAR,
} from "@/lib/utils/formation-helpers";
import {
  chooseRadio,
  chooseTab,
  clickBack,
  clickSave,
  fillText,
  generateBusinessForProfile,
  getBusinessNameValue,
  getBusinessProfileInputFieldName,
  getDateOfFormation,
  getEmployerIdValue,
  getEntityIdValue,
  getMunicipalityValue,
  getNotesValue,
  getTaxIdValue,
  renderPage,
  selectByText,
  selectByValue,
} from "@/test/pages/profile/profile-helpers";
import { generateOwningProfileData, OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

const date = getCurrentDate().subtract(1, "month").date(1);
const Config = getMergedConfig();

const dateOfFormation = date.format(defaultDateFormat);
const mockApi = api as vi.Mocked<typeof api>;

function setupMockAnalytics(): typeof analytics {
  return {
    ...vi.requireActual("@/lib/utils/analytics").default,
    event: {
      ...vi.requireActual("@/lib/utils/analytics").default.event,
      profile_location_question: {
        submit: {
          location_entered_for_first_time: vi.fn(),
        },
      },
    },
  };
}

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/api-client/apiClient", () => ({ postGetAnnualFilings: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("@/lib/utils/analytics", () => setupMockAnalytics());

describe("profile - owning existing business", () => {
  let business: Business;

  beforeEach(() => {
    vi.resetAllMocks();
    useMockRouter({});
    useMockRoadmap({});
    setupStatefulUserDataContext();
    mockApi.postGetAnnualFilings.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
    business = generateBusinessForProfile({
      profileData: generateOwningProfileData({}),
    });
  });

  it("user is able to save and is redirected to dashboard", async () => {
    const inputFieldName = getBusinessProfileInputFieldName(business);

    renderPage({ business });

    fillText(inputFieldName, "Cool Computers");
    clickSave();
    await waitFor(() => {
      return expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard?success=true");
    });
  });

  it("prevents user from going back to dashboard if there are unsaved changes", () => {
    const inputFieldName = getBusinessProfileInputFieldName(business);

    renderPage({ business });
    fillText(inputFieldName, "Cool Computers");
    clickBack();
    expect(screen.getByText(Config.profileDefaults.default.escapeModalReturn)).toBeInTheDocument();
  });

  it("returns user to profile page from un-saved changes modal", () => {
    const inputFieldName = getBusinessProfileInputFieldName(business);

    renderPage({ business });
    fillText(inputFieldName, "Cool Computers");
    clickBack();
    fireEvent.click(screen.getByText(Config.profileDefaults.default.escapeModalEscape));
    expect(screen.getByLabelText(inputFieldName)).toBeInTheDocument();
  });

  it("updates the user data on save", async () => {
    const business = generateBusinessForProfile({
      profileData: generateOwningProfileData({
        taxId: randomInt(9).toString(),
        industryId: "generic",
        legalStructureId: "limited-liability-company",
      }),
      onboardingFormProgress: "COMPLETED",
    });
    const randomMunicipality = generateMunicipality({ displayName: "Newark" });

    renderPage({ business, municipalities: [randomMunicipality] });

    fillText("Business name", "Cool Computers");
    fillText("Date of formation", date.format("MM/YYYY"));
    fillText("Address line1", "123 main st");
    fillText("Address line2", "apt 1");
    selectByText("Address municipality", randomMunicipality.displayName);
    fillText("Address zip code", "08123");

    selectByValue("Sector", "clean-energy");
    fillText("Existing employees", "123");
    selectByText("Location", randomMunicipality.displayName);
    selectByValue("Ownership", "veteran-owned");
    selectByValue("Ownership", "woman-owned");
    chooseRadio("home-based-business-radio-true");
    chooseTab("numbers");
    fillText("Employer id", "02-3456780");
    fillText("Entity id", "0234567890");
    fillText("Tax id", "023456790");
    fillText("Tax id location", "123");
    fillText("Tax pin", "6666");
    chooseTab("notes");
    fillText("Notes", "whats appppppp");
    clickSave();

    await waitFor(() => {
      expect(screen.getByTestId("snackbar-alert-SUCCESS")).toBeInTheDocument();
    });
    expect(currentBusiness()).toEqual({
      ...business,
      onboardingFormProgress: "COMPLETED",
      taxFilingData: { ...business.taxFilingData, state: undefined, filings: [], registeredISO: undefined },
      profileData: {
        ...business.profileData,
        businessName: "Cool Computers",
        homeBasedBusiness: true,
        existingEmployees: "123",
        ownershipTypeIds: ["veteran-owned", "woman-owned"],
        municipality: randomMunicipality,
        dateOfFormation,
        taxId: "023456790123",
        entityId: "0234567890",
        employerId: "023456780",
        notes: "whats appppppp",
        taxPin: "6666",
        sectorId: "clean-energy",
      },
      formationData: {
        ...business.formationData,
        formationFormData: {
          ...business.formationData.formationFormData,
          addressLine1: "123 main st",
          addressLine2: "apt 1",
          addressMunicipality: randomMunicipality,
          addressZipCode: "08123",
          addressState: {
            name: "New Jersey",
            shortCode: "NJ",
          },
        },
      },
    });
  });

  it("prefills form from existing user data", () => {
    const randomMunicipality = generateMunicipality({});
    const business = generateBusinessForProfile({
      profileData: generateOwningProfileData({
        businessName: "Applebees",
        entityId: "1234567890",
        employerId: "123456789",
        legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
        dateOfFormation,
        taxId: "123456790",
        notes: "whats appppppp",
        municipality: randomMunicipality,
        ownershipTypeIds: ["veteran-owned", "woman-owned"],
        homeBasedBusiness: false,
        existingEmployees: "123",
        taxPin: "6666",
        sectorId: "clean-energy",
        industryId: "generic",
      }),
    });

    const veteran = LookupOwnershipTypeById("veteran-owned").name;
    const woman = LookupOwnershipTypeById("woman-owned").name;

    renderPage({ business });

    expect(getBusinessNameValue()).toEqual("Applebees");
    expect(getMunicipalityValue()).toEqual(randomMunicipality.displayName);
    expect(getSectorIDValue()).toEqual(LookupSectorTypeById("clean-energy").name);
    expect(screen.queryByLabelText("Ownership")).toHaveTextContent(`${veteran}, ${woman}`);
    expect(getRadioButtonFromFormControlLabel("home-based-business-radio-false")).toBeChecked();
    expect(getExistingEmployeesValue()).toEqual("123");
    expect(getDateOfFormation()).toEqual(date.format("MM/YYYY"));
    chooseTab("numbers");
    expect(getEmployerIdValue()).toEqual("12-3456789");
    expect(getEntityIdValue()).toEqual("1234567890");
    expect(getTaxIdValue()).toEqual("123-456-790");
    expect(getTaxPinValue()).toEqual("6666");
    chooseTab("notes");
    expect(getNotesValue()).toEqual("whats appppppp");
  });

  it("shows an error when tax pin input is not empty or is less than 4 digits", async () => {
    renderPage({ business });
    chooseTab("numbers");

    fillText("Tax pin", "");
    fireEvent.blur(screen.getByLabelText("Tax pin"));
    expect(
      screen.queryByText(Config.profileDefaults.fields.taxPin.default.errorTextRequired)
    ).not.toBeInTheDocument();

    fillText("Tax pin", "123");
    fireEvent.blur(screen.getByLabelText("Tax pin"));
    await waitFor(() => {
      expect(
        screen.getByText(Config.profileDefaults.fields.taxPin.default.errorTextRequired)
      ).toBeInTheDocument();
    });

    fillText("Tax pin", "1234");
    fireEvent.blur(screen.getByLabelText("Tax pin"));
    await waitFor(() => {
      expect(
        screen.queryByText(Config.profileDefaults.fields.taxPin.default.errorTextRequired)
      ).not.toBeInTheDocument();
    });
  });

  it("prevents user from saving if they partially entered Employer Id", async () => {
    renderPage({ business });
    chooseTab("numbers");

    fillText("Employer id", "123490");
    fireEvent.blur(screen.queryByLabelText("Employer id") as HTMLElement);
    clickSave();
    await waitFor(() => {
      expect(
        screen.getByText(
          templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, { length: "9" })
        )
      ).toBeInTheDocument();
    });
    expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
  });

  it("prevents user from saving if sector is not selected", async () => {
    const business = generateBusinessForProfile({
      profileData: generateOwningProfileData({
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
        sectorId: "",
      }),
    });
    renderPage({ business });
    fireEvent.blur(screen.queryByLabelText("Sector") as HTMLElement);

    clickSave();
    await waitFor(() => {
      expect(
        screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
      ).toBeInTheDocument();
    });
    expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
  });

  it("returns user back to dashboard", async () => {
    renderPage({ business });

    clickBack();
    await waitFor(() => {
      return expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  it("returns user to dashboard from un-saved changes modal", async () => {
    const randomMunicipality = generateMunicipality({});
    renderPage({ business, municipalities: [randomMunicipality] });
    selectByText("Location", randomMunicipality.displayName);
    clickBack();
    fireEvent.click(screen.getByText(Config.profileDefaults.default.escapeModalReturn));
    await waitFor(() => {
      expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
    expect(() => {
      return currentUserData();
    }).toThrow();
  });

  it("displays business info tab", () => {
    renderPage({ business });
    expect(screen.getByTestId("info")).toBeInTheDocument();
  });

  it("displays date of formation input for public filing businesses", () => {
    const initialBusiness = generateBusinessForProfile({
      profileData: generateOwningProfileData({
        legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
      }),
    });
    renderPage({ business: initialBusiness });
    expect(screen.getByLabelText("Date of formation")).toBeInTheDocument();
  });

  it("does not display date of formation input for trade name businesses", () => {
    const initialBusiness = generateBusinessForProfile({
      profileData: generateOwningProfileData({
        legalStructureId: randomLegalStructure({ requiresPublicFiling: false }).id,
      }),
    });
    renderPage({ business: initialBusiness });
    expect(screen.queryByLabelText("Date of formation")).not.toBeInTheDocument();
  });

  it("displays NAICS code when it exists", () => {
    const initialBusiness = generateBusinessForProfile({
      profileData: generateOwningProfileData({
        naicsCode: "123456",
      }),
    });
    renderPage({ business: initialBusiness });
    chooseTab("numbers");
    expect(screen.getByTestId("profile-naics-code")).toBeInTheDocument();
    expect(screen.getByText("123456")).toBeInTheDocument();
  });

  it("doesn't display the NAICS code field when it doesn't exist", () => {
    const initialBusiness = generateBusinessForProfile({
      profileData: generateOwningProfileData({
        naicsCode: "",
      }),
    });
    renderPage({ business: initialBusiness });
    chooseTab("numbers");
    expect(screen.queryByTestId("profile-naics-code")).not.toBeInTheDocument();
  });

  describe("Location Section", () => {
    it("locks the location field if it is populated and tax filing state is SUCCESS", () => {
      const randomMunicipality = generateMunicipality({});
      renderPage({
        business: generateBusinessForProfile({
          profileData: generateOwningProfileData({
            municipality: randomMunicipality,
          }),
          taxFilingData: generateTaxFilingData({
            state: "SUCCESS",
          }),
        }),
      });
      expect(screen.getByText(randomMunicipality.displayName)).toBeInTheDocument();
      expect(screen.getByTestId("locked-municipality")).toBeInTheDocument();
    });
  });

  describe("Document Section", () => {
    it("has no document section", () => {
      renderPage({ business });
      expect(screen.queryByTestId("documents")).not.toBeInTheDocument();
    });
  });

  describe("trade name field behavior", () => {
    it("displays trade name field for an existing trade name business", () => {
      const business = generateBusinessForProfile({
        profileData: generateOwningProfileData({
          legalStructureId: "sole-proprietorship",
        }),
      });
      renderPage({ business });
      expect(screen.getByTestId("tradeName")).toBeInTheDocument();
    });

    it("hides trade name field for existing non trade name business", () => {
      const business = generateBusinessForProfile({
        profileData: generateOwningProfileData({
          legalStructureId: "limited-liability-company",
        }),
      });
      renderPage({ business });
      expect(screen.queryByTestId("tradeName")).not.toBeInTheDocument();
    });
  });

  describe("responsible owner name field behavior", () => {
    it("displays responsibleOwnerName field for an existing trade name business", () => {
      const business = generateBusinessForProfile({
        profileData: generateOwningProfileData({
          legalStructureId: "general-partnership",
        }),
      });
      renderPage({ business });
      expect(screen.getByTestId("responsibleOwnerName")).toBeInTheDocument();
    });

    it("hides responsibleOwnerName field for an existing non trade name business", () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-partnership",
        }),
      });
      renderPage({ business });
      expect(screen.queryByTestId("responsibleOwnerName")).not.toBeInTheDocument();
    });

    it("displays responsibleOwnerName as locked if user has accessed tax data", () => {
      const business = generateBusinessForProfile({
        profileData: generateOwningProfileData({
          legalStructureId: "sole-proprietorship",
        }),
        taxFilingData: generateTaxFilingData({
          state: "PENDING",
        }),
      });
      renderPage({ business });
      expect(
        screen.getByText(Config.profileDefaults.fields.responsibleOwnerName.default.header)
      ).toBeInTheDocument();
      expect(screen.queryByTestId("responsibleOwnerName")).not.toBeInTheDocument();
    });
  });

  describe("profile error alert", () => {
    it("displays alert with header when sector has an error", async () => {
      const business = generateBusinessForProfile({
        profileData: generateOwningProfileData({
          industryId: "generic",
          sectorId: undefined,
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
        }),
      });
      renderPage({ business });
      clickSave();
      const profileAlert = screen.getByTestId("profile-error-alert");
      await waitFor(() => {
        expect(profileAlert).toBeInTheDocument();
      });
      expect(
        within(profileAlert).getByText(Config.profileDefaults.fields.sectorId.default.header)
      ).toBeInTheDocument();
    });

    describe("address data is initially empty", () => {
      it("displays alert when address line 1 is filled then blurred", async () => {
        const business = generateBusinessForProfile({
          profileData: generateOwningProfileData({
            industryId: "generic",
            operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          }),
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              ...emptyAddressData,
            }),
          }),
        });
        renderPage({ business });
        fillText("Address line1", "Cool Computers");

        clickSave();
        const profileAlert = screen.getByTestId("profile-error-alert");
        await waitFor(() => {
          expect(profileAlert).toBeInTheDocument();
        });
        expect(
          within(profileAlert).queryByText(Config.formation.fields.addressLine1.label)
        ).not.toBeInTheDocument();
        expect(
          within(profileAlert).queryByText(Config.formation.fields.addressLine2.label)
        ).not.toBeInTheDocument();
        expect(within(profileAlert).getByText(Config.formation.fields.addressCity.label)).toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressZipCode.label)
        ).toBeInTheDocument();
      });

      it("displays alert when zip code is filled with valid zip and then blurred", async () => {
        const business = generateBusinessForProfile({
          profileData: generateOwningProfileData({
            industryId: "generic",
            operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          }),
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              ...emptyAddressData,
            }),
          }),
        });
        renderPage({ business });
        fillText("Address zip code", "08123");

        clickSave();
        const profileAlert = screen.getByTestId("profile-error-alert");
        await waitFor(() => {
          expect(profileAlert).toBeInTheDocument();
        });

        expect(
          within(profileAlert).getByText(Config.formation.fields.addressLine1.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).queryByText(Config.formation.fields.addressLine2.label)
        ).not.toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressMunicipality.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).queryByText(Config.formation.fields.addressZipCode.label)
        ).not.toBeInTheDocument();
      });

      it("displays alert when zip code is filled with invalid zip and then blurred", async () => {
        const business = generateBusinessForProfile({
          profileData: generateOwningProfileData({
            industryId: "generic",
            operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          }),
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              ...emptyAddressData,
            }),
          }),
        });
        renderPage({ business });
        fillText("Address zip code", "123");

        clickSave();
        const profileAlert = screen.getByTestId("profile-error-alert");
        await waitFor(() => {
          expect(profileAlert).toBeInTheDocument();
        });

        expect(
          within(profileAlert).getByText(Config.formation.fields.addressLine1.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).queryByText(Config.formation.fields.addressLine2.label)
        ).not.toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressMunicipality.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressZipCode.label)
        ).toBeInTheDocument();
      });

      it("displays alert when address city is selected then blurred", async () => {
        const randomMunicipality = generateMunicipality({});
        const business = generateBusinessForProfile({
          profileData: generateOwningProfileData({
            industryId: "generic",
            operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          }),
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              ...emptyAddressData,
            }),
          }),
        });
        renderPage({ business, municipalities: [randomMunicipality] });

        selectByText("Address municipality", randomMunicipality.displayName);
        expect(screen.getByLabelText("Address municipality")).toHaveValue(randomMunicipality.displayName);
        fireEvent.blur(screen.getByLabelText("Address municipality"));

        clickSave();
        const profileAlert = screen.getByTestId("profile-error-alert");

        await waitFor(() => {
          expect(profileAlert).toBeInTheDocument();
        });
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressZipCode.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressLine1.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).queryByText(Config.formation.fields.addressLine2.label)
        ).not.toBeInTheDocument();
        expect(
          within(profileAlert).queryByText(Config.formation.fields.addressMunicipality.label)
        ).not.toBeInTheDocument();
      });

      it("displays alert when max character limit for business line 1 is reached", async () => {
        const business = generateBusinessForProfile({
          profileData: generateOwningProfileData({
            industryId: "generic",
            operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          }),
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              ...emptyAddressData,
            }),
          }),
        });
        renderPage({ business });
        fillText("Address line1", "a".repeat(BUSINESS_ADDRESS_LINE_1_MAX_CHAR + 1));

        clickSave();
        const profileAlert = screen.getByTestId("profile-error-alert");

        await waitFor(() => {
          expect(profileAlert).toBeInTheDocument();
        });
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressLine1.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).queryByText(Config.formation.fields.addressLine2.label)
        ).not.toBeInTheDocument();
        expect(within(profileAlert).getByText(Config.formation.fields.addressCity.label)).toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressZipCode.label)
        ).toBeInTheDocument();
      });

      it("displays alert business line 2 is filled then blurred", async () => {
        const business = generateBusinessForProfile({
          profileData: generateOwningProfileData({
            industryId: "generic",
            operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          }),
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              ...emptyAddressData,
            }),
          }),
        });
        renderPage({ business });
        fillText("Address line2", "a");

        clickSave();
        const profileAlert = screen.getByTestId("profile-error-alert");

        await waitFor(() => {
          expect(profileAlert).toBeInTheDocument();
        });
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressLine1.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).queryByText(Config.formation.fields.addressLine2.label)
        ).not.toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressMunicipality.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressZipCode.label)
        ).toBeInTheDocument();
      });

      it("displays alert when max character limit for business line 2 is reached", async () => {
        const business = generateBusinessForProfile({
          profileData: generateOwningProfileData({
            industryId: "generic",
            operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          }),
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              ...emptyAddressData,
            }),
          }),
        });
        renderPage({ business });
        fillText("Address line2", "a".repeat(BUSINESS_ADDRESS_LINE_2_MAX_CHAR + 1));

        clickSave();
        const profileAlert = screen.getByTestId("profile-error-alert");

        await waitFor(() => {
          expect(profileAlert).toBeInTheDocument();
        });
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressLine1.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressLine2.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressMunicipality.label)
        ).toBeInTheDocument();
        expect(
          within(profileAlert).getByText(Config.formation.fields.addressZipCode.label)
        ).toBeInTheDocument();
      });
    });
  });

  describe("non essential questions", () => {
    it("does not show elevator questions for owning businesses", async () => {
      const business = generateBusinessForProfile({
        profileData: generateOwningProfileData({
          industryId: "generic",
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          homeBasedBusiness: false,
        }),
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            ...emptyAddressData,
          }),
        }),
      });
      renderPage({ business });

      expect(screen.queryByTestId("elevatorOwningBusiness-radio-group")).not.toBeInTheDocument();
    });

    it("shows vacant building question for owning guest mode users", async () => {
      const business = generateBusinessForProfile({
        profileData: generateOwningProfileData({
          industryId: "real-estate-investor",
          operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
          businessPersona: "OWNING",
          homeBasedBusiness: false,
        }),
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            ...emptyAddressData,
          }),
        }),
      });
      renderPage({ business });

      expect(screen.getByTestId("vacantPropertyOwner-radio-group")).toBeInTheDocument();
    });

    it("shows vacant building question for owning signed in users", async () => {
      const business = generateBusinessForProfile({
        profileData: generateOwningProfileData({
          industryId: "real-estate-investor",
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
          businessPersona: "OWNING",
          homeBasedBusiness: false,
        }),
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            ...emptyAddressData,
          }),
        }),
      });
      renderPage({ business });

      expect(screen.getByTestId("vacantPropertyOwner-radio-group")).toBeInTheDocument();
    });
  });

  const getSectorIDValue = (): string => {
    return (screen.queryByLabelText("Sector") as HTMLInputElement)?.value;
  };

  const getExistingEmployeesValue = (): string => {
    return (screen.getByLabelText("Existing employees") as HTMLInputElement).value;
  };

  const getTaxPinValue = (): string => {
    return (screen.getByLabelText("Tax pin") as HTMLInputElement).value;
  };

  const getRadioButtonFromFormControlLabel = (dataTestId: string): HTMLInputElement => {
    return within(screen.getByTestId(dataTestId) as HTMLInputElement).getByRole("radio");
  };
});
