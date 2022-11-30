import { TaxRegistrationModal } from "@/components/TaxRegistrationModal";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import * as buildUserRoadmap from "@/lib/roadmap/buildUserRoadmap";
import * as analyticsHelpers from "@/lib/utils/analytics-helpers";
import { getFlow } from "@/lib/utils/helpers";
import { generateProfileData, generateRoadmap, generateUserData } from "@/test/factories";
import { withRoadmap } from "@/test/helpers/helpers-renderers";
import { fillText, selectLocationByText } from "@/test/helpers/helpers-testing-library-selectors";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import {
  currentUserData,
  setupStatefulUserDataContext,
  triggerQueueUpdate,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { LegalStructures, LookupOwnershipTypeById, UserData } from "@businessnjgovnavigator/shared";
import { generateMunicipality } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const Config = getMergedConfig();
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/utils/analytics-helpers", () => {
  return { setAnalyticsDimensions: jest.fn() };
});
jest.mock("@/lib/roadmap/buildUserRoadmap", () => {
  return { buildUserRoadmap: jest.fn() };
});

const mockBuildUserRoadmap = buildUserRoadmap as jest.Mocked<typeof buildUserRoadmap>;
const mockAnalyticsHelpers = analyticsHelpers as jest.Mocked<typeof analyticsHelpers>;

describe("<TaxRegistrationModal>", () => {
  let setRoadmap: jest.Mock;
  let modalOnClose: jest.Mock;
  const municipality = generateMunicipality({});

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    setRoadmap = jest.fn();
    modalOnClose = jest.fn();
    mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(generateRoadmap({}));
  });

  const renderComponent = (initialUserData?: UserData) => {
    const userData = initialUserData ?? generateUserData({});

    const userDataWithMunicipality = {
      ...userData,
      profileData: {
        ...userData.profileData,
        municipality: userData.profileData.municipality !== undefined ? municipality : undefined,
      },
    };

    render(
      withRoadmap(
        <MunicipalitiesContext.Provider value={{ municipalities: [municipality] }}>
          <WithStatefulUserData initialUserData={userDataWithMunicipality}>
            <TaxRegistrationModal isOpen={true} close={modalOnClose} onSave={() => {}} />
          </WithStatefulUserData>
        </MunicipalitiesContext.Provider>,
        generateRoadmap({}),
        undefined,
        setRoadmap
      )
    );
  };

  it("builds roadmap and sets analytics on save", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        municipality: municipality,
        taxId: "123456789012",
      }),
    });
    renderComponent(userData);

    const returnedRoadmap = generateRoadmap({});
    mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(returnedRoadmap);

    fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
    triggerQueueUpdate();
    await waitFor(() => {
      return expect(mockBuildUserRoadmap.buildUserRoadmap).toHaveBeenCalledWith(userData.profileData);
    });
    await waitFor(() => {
      return expect(setRoadmap).toHaveBeenCalledWith(returnedRoadmap);
    });
    expect(mockAnalyticsHelpers.setAnalyticsDimensions).toHaveBeenCalledWith(userData.profileData);
  });

  describe("when trade name legal structure", () => {
    it("does not show businessName nor taxId field", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomTradeNameLegalStructure(),
        }),
      });

      renderComponent(userData);

      expect(
        screen.queryByText(markdownToText(Config.profileDefaults.STARTING.businessName.header))
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(markdownToText(Config.profileDefaults.STARTING.taxId.header))
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.STARTING.existingEmployees.header))
      ).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.STARTING.ownershipTypeIds.header))
      ).toBeInTheDocument();
    });

    it("fills and saves the Ownership and Employees field", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomTradeNameLegalStructure(),
          ownershipTypeIds: [],
          existingEmployees: undefined,
        }),
      });

      renderComponent(userData);

      fillText("Existing employees", "5");
      selectOwnershipByValue("disabled-veteran");

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      triggerQueueUpdate();
      expect(currentUserData().profileData.existingEmployees).toEqual("5");
      expect(currentUserData().profileData.ownershipTypeIds).toEqual(["disabled-veteran"]);
    });

    it("does not show error for Ownership field when not selected", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomTradeNameLegalStructure(),
          ownershipTypeIds: [],
          existingEmployees: undefined,
        }),
      });

      renderComponent(userData);

      fillText("Existing employees", "5");

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      triggerQueueUpdate();
      expect(currentUserData().profileData.ownershipTypeIds).toEqual([]);
    });

    it("shows error for existingEmployees field when not selected", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomTradeNameLegalStructure(),
          ownershipTypeIds: [],
          existingEmployees: undefined,
        }),
      });

      renderComponent(userData);

      expect(
        screen.queryByText(Config.profileDefaults.STARTING.existingEmployees.errorTextRequired)
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      expect(
        screen.getByText(Config.profileDefaults.STARTING.existingEmployees.errorTextRequired)
      ).toBeInTheDocument();
    });

    it("shows and saves municipality field when user municipality is undefined", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomTradeNameLegalStructure(),
          municipality: undefined,
        }),
      });

      renderComponent(userData);

      expect(
        screen.getByText(markdownToText(Config.profileDefaults.STARTING.municipality.header))
      ).toBeInTheDocument();

      selectLocationByText(municipality.displayName);
      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      triggerQueueUpdate();
      expect(currentUserData().profileData.municipality).toEqual(municipality);
    });

    it("does not show municipality field when user municipality already exists", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomTradeNameLegalStructure(),
          municipality: generateMunicipality({}),
        }),
      });

      renderComponent(userData);

      expect(
        screen.queryByText(markdownToText(Config.profileDefaults.STARTING.municipality.header))
      ).not.toBeInTheDocument();
    });

    it("shows error for municipality field when not selected", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomTradeNameLegalStructure(),
          ownershipTypeIds: [],
          existingEmployees: undefined,
          municipality: undefined,
        }),
      });

      renderComponent(userData);

      fillText("Existing employees", "5");

      expect(
        screen.queryByText(Config.profileDefaults.STARTING.municipality.errorTextRequired)
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      expect(
        screen.getByText(Config.profileDefaults.STARTING.municipality.errorTextRequired)
      ).toBeInTheDocument();
    });
  });

  describe("when public filing legal structure", () => {
    it("shows relevant fields when businessName not populated", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessName: "",
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });

      renderComponent(userData);

      expect(
        screen.getByText(markdownToText(Config.profileDefaults.STARTING.businessName.header))
      ).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.STARTING.taxId.header))
      ).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.STARTING.existingEmployees.header))
      ).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.STARTING.ownershipTypeIds.header))
      ).toBeInTheDocument();
    });

    it("does not show businessName field when already populated", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessName: "test-business",
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });

      renderComponent(userData);

      expect(
        screen.queryByText(markdownToText(Config.profileDefaults.STARTING.businessName.header))
      ).not.toBeInTheDocument();
    });

    describe("validations", () => {
      let userData: UserData;

      beforeEach(() => {
        userData = generateUserData({
          profileData: generateProfileData({
            legalStructureId: randomPublicFilingLegalStructure(),
            ownershipTypeIds: [],
            existingEmployees: undefined,
            businessName: "",
            taxId: undefined,
          }),
        });
      });

      it("does not show error for Ownership field when not selected", () => {
        renderComponent(userData);

        fillText("Existing employees", "5");
        fillText("Business name", "my cool coffeeshop");
        fillText("Tax id", "123456789012");

        fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
        triggerQueueUpdate();
        expect(currentUserData().profileData.ownershipTypeIds).toEqual([]);
      });

      it("shows error for existingEmployees field when not selected", () => {
        renderComponent(userData);

        expect(
          screen.queryByText(Config.profileDefaults.STARTING.existingEmployees.errorTextRequired)
        ).not.toBeInTheDocument();

        fillText("Business name", "my cool coffeeshop");
        fillText("Tax id", "123456789012");

        fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
        expect(
          screen.getByText(Config.profileDefaults.STARTING.existingEmployees.errorTextRequired)
        ).toBeInTheDocument();
      });

      it("shows error for taxId field when not selected", () => {
        renderComponent(userData);

        expect(
          screen.queryByText(Config.profileDefaults.STARTING.taxId.errorTextRequired)
        ).not.toBeInTheDocument();

        fillText("Business name", "my cool coffeeshop");
        fillText("Existing employees", "5");

        fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
        expect(screen.getByText(Config.profileDefaults.STARTING.taxId.errorTextRequired)).toBeInTheDocument();
      });

      it("shows error for businessName field when not selected", () => {
        renderComponent(userData);

        expect(
          screen.queryByText(Config.profileDefaults.STARTING.businessName.errorTextRequired)
        ).not.toBeInTheDocument();

        fillText("Existing employees", "5");
        fillText("Tax id", "123456789012");

        fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
        expect(
          screen.getByText(Config.profileDefaults.STARTING.businessName.errorTextRequired)
        ).toBeInTheDocument();
      });
    });

    it("fills and saves businessName, Ownership, existingEmployees, taxId fields", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomPublicFilingLegalStructure(),
          ownershipTypeIds: [],
          existingEmployees: undefined,
          businessName: "",
          taxId: undefined,
        }),
      });

      renderComponent(userData);

      fillText("Existing employees", "5");
      selectOwnershipByValue("disabled-veteran");
      fillText("Business name", "my cool coffeeshop");
      fillText("Tax id", "123456789012");

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      triggerQueueUpdate();
      expect(currentUserData().profileData.existingEmployees).toEqual("5");
      expect(currentUserData().profileData.ownershipTypeIds).toEqual(["disabled-veteran"]);
      expect(currentUserData().profileData.businessName).toEqual("my cool coffeeshop");
      expect(currentUserData().profileData.taxId).toEqual("123456789012");
    });

    describe("tax id", () => {
      let userData: UserData;

      beforeEach(() => {
        userData = generateUserData({
          profileData: generateProfileData({
            legalStructureId: "limited-liability-partnership",
            businessPersona: "STARTING",
          }),
        });
      });

      it("does not close model and fires validation for tax id less than 12 digits", () => {
        renderComponent({
          ...userData,
          profileData: {
            ...userData.profileData,
            businessName: "NJ Services",
            taxId: "",
            ownershipTypeIds: ["woman-owned"],
            existingEmployees: "3",
          },
        });
        fireEvent.click(screen.getByLabelText("Tax id"));
        fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456" } });
        fireEvent.blur(screen.getByLabelText("Tax id"));
        fireEvent.click(screen.getByTestId("modal-button-primary"));
        expect(modalOnClose).not.toHaveBeenCalled();
        expect(
          screen.getByText(Config.profileDefaults[getFlow(userData.profileData)].taxId.errorTextRequired)
        ).toBeInTheDocument();
      });

      it("displays businessName field when it is not in profileData", () => {
        renderComponent({
          ...userData,
          profileData: {
            ...userData.profileData,
            businessName: "",
            taxId: "123456789000",
            ownershipTypeIds: ["woman-owned"],
            existingEmployees: "3",
          },
        });
        expect(screen.getByLabelText("Business name")).toBeInTheDocument();
      });

      it("pre-populates user data from profile data", () => {
        renderComponent({
          ...userData,
          profileData: {
            ...userData.profileData,
            businessName: "NJ Services",
            taxId: "123456789000",
            ownershipTypeIds: ["woman-owned"],
            existingEmployees: "3",
          },
        });
        const woman = LookupOwnershipTypeById("woman-owned").name;

        expect((screen.getByLabelText("Tax id") as HTMLInputElement).value).toEqual("123-456-789/000");
        expect(screen.queryByLabelText("Business name")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Ownership")).toHaveTextContent(`${woman}`);
        expect((screen.getByLabelText("Existing employees") as HTMLInputElement).value).toEqual("3");
      });
    });
  });
});

const randomTradeNameLegalStructure = () => {
  const tradeNameLegalStructures = LegalStructures.filter((x) => {
    return x.hasTradeName;
  });
  const randomIndex = Math.floor(Math.random() * tradeNameLegalStructures.length);
  return tradeNameLegalStructures[randomIndex].id;
};

const randomPublicFilingLegalStructure = () => {
  const nonTradeNameLegalStructures = LegalStructures.filter((x) => {
    return x.requiresPublicFiling;
  });
  const randomIndex = Math.floor(Math.random() * nonTradeNameLegalStructures.length);
  return nonTradeNameLegalStructures[randomIndex].id;
};

const selectOwnershipByValue = (value: string) => {
  fireEvent.mouseDown(screen.getByLabelText("Ownership"));
  const listbox = within(screen.getByRole("listbox"));
  fireEvent.click(listbox.getByTestId(value));
};
