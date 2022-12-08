import { TaxRegistrationModal } from "@/components/TaxRegistrationModal";
import { getMergedConfig } from "@/contexts/configContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { generateProfileData, generateUserData } from "@/test/factories";
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
import { fireEvent, render, screen, within } from "@testing-library/react";

const Config = getMergedConfig();
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});

describe("<TaxRegistrationModal>", () => {
  let modalOnClose: jest.Mock;
  const municipality = generateMunicipality({});

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    modalOnClose = jest.fn();
  });

  const renderComponent = (initialUserData?: UserData) => {
    const userData = initialUserData ?? generateUserData({});

    const userDataWithMunicipality = {
      ...userData,
      profileData: {
        ...userData.profileData,
        municipality: userData.profileData.municipality === undefined ? undefined : municipality,
      },
    };

    render(
      <MunicipalitiesContext.Provider value={{ municipalities: [municipality] }}>
        <WithStatefulUserData initialUserData={userDataWithMunicipality}>
          <TaxRegistrationModal isOpen={true} close={modalOnClose} onSave={() => {}} />
        </WithStatefulUserData>
      </MunicipalitiesContext.Provider>
    );
  };

  describe("when trade name legal structure", () => {
    it("does not show businessName nor taxId field", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: randomTradeNameLegalStructure(),
        }),
      });

      renderComponent(userData);

      expect(
        screen.queryByText(markdownToText(Config.profileDefaults.fields.businessName.default.header))
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(markdownToText(Config.profileDefaults.fields.taxId.default.header))
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.fields.existingEmployees.default.header))
      ).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.fields.ownershipTypeIds.default.header))
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
        screen.queryByText(Config.profileDefaults.fields.existingEmployees.default.errorTextRequired)
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      expect(
        screen.getByText(Config.profileDefaults.fields.existingEmployees.default.errorTextRequired)
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
        screen.getByText(markdownToText(Config.profileDefaults.fields.municipality.default.header))
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
        screen.queryByText(markdownToText(Config.profileDefaults.fields.municipality.default.header))
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
        screen.queryByText(Config.profileDefaults.fields.municipality.default.errorTextRequired)
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
      expect(
        screen.getByText(Config.profileDefaults.fields.municipality.default.errorTextRequired)
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
        screen.getByText(markdownToText(Config.profileDefaults.fields.businessName.default.header))
      ).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.fields.taxId.default.header))
      ).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.fields.existingEmployees.default.header))
      ).toBeInTheDocument();
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.fields.ownershipTypeIds.default.header))
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
        screen.queryByText(markdownToText(Config.profileDefaults.fields.businessName.default.header))
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
          screen.queryByText(Config.profileDefaults.fields.existingEmployees.default.errorTextRequired)
        ).not.toBeInTheDocument();

        fillText("Business name", "my cool coffeeshop");
        fillText("Tax id", "123456789012");

        fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
        expect(
          screen.getByText(Config.profileDefaults.fields.existingEmployees.default.errorTextRequired)
        ).toBeInTheDocument();
      });

      it("shows error for taxId field when not selected", () => {
        renderComponent(userData);

        expect(
          screen.queryByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
        ).not.toBeInTheDocument();

        fillText("Business name", "my cool coffeeshop");
        fillText("Existing employees", "5");

        fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
        expect(
          screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
        ).toBeInTheDocument();
      });

      it("shows error for businessName field when not selected", () => {
        renderComponent(userData);

        expect(
          screen.queryByText(Config.profileDefaults.fields.businessName.default.errorTextRequired)
        ).not.toBeInTheDocument();

        fillText("Existing employees", "5");
        fillText("Tax id", "123456789012");

        fireEvent.click(screen.getByText(Config.taxRegistrationModal.saveButtonText));
        expect(
          screen.getByText(Config.profileDefaults.fields.businessName.default.errorTextRequired)
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
          screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
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
