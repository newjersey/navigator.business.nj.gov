import analytics from "@/lib/utils/analytics";
import { generateEmptyFormationData, generateFormationDbaContent } from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import {
  createEmptyFormationFormData,
  foreignLegalTypePrefix,
  FormationLegalType,
  generateBusiness,
  generateBusinessNameAvailability,
  generateFormationFormData,
  NameAvailability,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import * as materialUi from "@mui/material";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      formation_task_name_reservation_yes_option: {
        click: {
          show_additional_options: jest.fn(),
        },
      },
      formation_task_name_reservation_different_name_option: {
        click: {
          continue_formation_task: jest.fn(),
        },
      },
      formation_task_name_reservation_keep_reservation_option: {
        click: {
          instruct_close_formation_task: jest.fn(),
        },
      },
      formation_task_name_reservation_cancel_reservation_option: {
        click: {
          continue_formation_task: jest.fn(),
        },
      },
    },
  };
}

const Config = getMergedConfig();

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("Formation - BusinessNameStep", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = (
    initialBusinessName?: string,
    businessNameAvailability?: NameAvailability,
  ): FormationPageHelpers => {
    const profileData = initialBusinessName
      ? generateFormationProfileData({ businessName: initialBusinessName })
      : generateFormationProfileData({});
    const formationData = {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: businessNameAvailability ?? undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    };
    return preparePage({
      business: generateBusiness({ profileData, formationData }),
      displayContent: { formationDbaContent: generateFormationDbaContent({}) },
    });
  };

  it("pre-fills the text field with the business name from profile", () => {
    getPageHelper("My Restaurant");
    expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My Restaurant",
    );
  });

  it("pre-fills the error state with the error from formation data", () => {
    getPageHelper(
      "My Restaurant",
      generateBusinessNameAvailability({
        status: "UNAVAILABLE",
      }),
    );
    expect(screen.getByTestId("unavailable-text")).toBeInTheDocument();
  });

  it("overrides the text field's initial value if user types in field", () => {
    const page = getPageHelper("My Restaurant");
    expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My Restaurant",
    );

    page.fillText("Search business name", "My New Restaurant");
    expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My New Restaurant",
    );
  });

  it("displays the enter a business name inline error when user blurs without entering anything", () => {
    const page = getPageHelper();
    page.fillAndBlurBusinessName("");
    expect(
      screen.getByText(Config.formation.fields.businessName.errorInlineEmpty),
    ).toBeInTheDocument();
  });

  it("displays the enter a business name inline error when user deletes existing business name and blurs the field", () => {
    const page = getPageHelper();
    page.fillAndBlurBusinessName("Test Name");
    expect(
      screen.getByText(Config.formation.fields.businessName.confirmBusinessNameError),
    ).toBeInTheDocument();

    page.fillAndBlurBusinessName("");
    expect(
      screen.getByText(Config.formation.fields.businessName.errorInlineEmpty),
    ).toBeInTheDocument();
  });

  it("displays the business names must match inline error when user hasnt confirmed", () => {
    const page = getPageHelper();
    page.fillAndBlurBusinessName("Test Name");
    expect(
      screen.getByText(Config.formation.fields.businessName.confirmBusinessNameError),
    ).toBeInTheDocument();
  });

  it("displays the check availability inline error when user confirms and blurs without searching", () => {
    const page = getPageHelper();
    page.fillAndBlurBusinessName("Test Name");
    page.fillAndBlurBusinessNameConfirmation("Test Name");
    expect(
      screen.getByText(Config.formation.fields.businessName.errorInlineNeedsToSearch),
    ).toBeInTheDocument();
  });

  it("displays the business names must match inline error when user types in a new name after finding an available one", async () => {
    const page = getPageHelper();

    page.fillAndBlurBusinessName("Test Name");
    page.fillAndBlurBusinessNameConfirmation("Test Name");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(screen.getByTestId("available-text")).toBeInTheDocument();
    await page.fillAndBlurBusinessName("New Name");
    expect(
      screen.getByText(Config.formation.fields.businessName.confirmBusinessNameError),
    ).toBeInTheDocument();
  });

  it("does not display available alert if user types in new name after finding an available one", async () => {
    const page = getPageHelper();

    page.fillAndBlurBusinessName("Test Name");
    page.fillAndBlurBusinessNameConfirmation("Test Name");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(screen.getByTestId("available-text")).toBeInTheDocument();

    page.fillText("Search business name", "New Name");
    expect(screen.queryByTestId("available-text")).not.toBeInTheDocument();
  });

  it("shows available text if name is available", async () => {
    const page = getPageHelper();

    page.fillAndBlurBusinessName("Test Name");
    page.fillAndBlurBusinessNameConfirmation("Test Name");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(screen.getByTestId("available-text")).toBeInTheDocument();
    expect(screen.queryByTestId("unavailable-text")).not.toBeInTheDocument();
  });

  it("shows unavailable text if name is not available", async () => {
    const page = getPageHelper();

    page.fillAndBlurBusinessName("Test Name");
    page.fillAndBlurBusinessNameConfirmation("Test Name");
    await page.searchBusinessName({ status: "UNAVAILABLE" });
    expect(screen.getByTestId("unavailable-text")).toBeInTheDocument();
    expect(screen.queryByTestId("available-text")).not.toBeInTheDocument();
  });

  it("shows DESIGNATOR error text if name is not available", async () => {
    const page = getPageHelper();

    page.fillAndBlurBusinessName("Test Name");
    page.fillAndBlurBusinessNameConfirmation("Test Name");
    await page.searchBusinessName({ status: "DESIGNATOR_ERROR" });
    expect(screen.getByTestId("designator-error-text")).toBeInTheDocument();
  });

  it("shows SPECIAL_CHARACTER error text if name is not available", async () => {
    const page = getPageHelper();

    page.fillAndBlurBusinessName("Test Name");
    page.fillAndBlurBusinessNameConfirmation("Test Name");
    await page.searchBusinessName({ status: "SPECIAL_CHARACTER_ERROR" });
    expect(screen.getByTestId("special-character-error-text")).toBeInTheDocument();
  });

  it("shows RESTRICTED error text if name is not available", async () => {
    const page = getPageHelper();

    page.fillAndBlurBusinessName("Test Name");
    page.fillAndBlurBusinessNameConfirmation("Test Name");
    await page.searchBusinessName({ status: "RESTRICTED_ERROR", invalidWord: "Joint" });
    expect(screen.getByTestId("restricted-word-error-text")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("restricted-word-error-text")).getByText("Joint", { exact: false }),
    ).toBeInTheDocument();
  });

  it("shows similar unavailable names when not available", async () => {
    const page = getPageHelper();

    page.fillAndBlurBusinessName("Test Name");
    page.fillAndBlurBusinessNameConfirmation("Test Name");
    await page.searchBusinessName({
      status: "UNAVAILABLE",
      similarNames: ["Rusty's Pizza", "Pizzapizza"],
    });
    expect(screen.getByText("Rusty's Pizza")).toBeInTheDocument();
    expect(screen.getByText("Pizzapizza")).toBeInTheDocument();
  });

  it("shows message if search returns 400", async () => {
    const page = getPageHelper();

    page.fillAndBlurBusinessName("LLC");
    page.fillAndBlurBusinessNameConfirmation("LLC");
    await page.searchBusinessNameAndGetError(400);
    expect(screen.getByTestId("error-alert-BAD_INPUT")).toBeInTheDocument();

    page.fillAndBlurBusinessName("LLCA");
    page.fillAndBlurBusinessNameConfirmation("LLCA");
    await page.searchBusinessName({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-BAD_INPUT")).not.toBeInTheDocument();
  });

  it("shows error if search fails with 500", async () => {
    const page = getPageHelper();

    page.fillAndBlurBusinessName("Test Name");
    page.fillAndBlurBusinessNameConfirmation("Test Name");
    await page.searchBusinessNameAndGetError(500);
    expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
    page.fillAndBlurBusinessName("New Name");
    page.fillAndBlurBusinessNameConfirmation("New Name");
    await page.searchBusinessName({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
  });

  describe("check name reservation sections", () => {
    it("if checkNameReservation is 'NO', it shows normal business name section", async () => {
      getPageHelper();

      const noButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.didYouUseFormRadio.option1,
      });
      await userEvent.click(noButton);

      const checkAvailableNamesSection = screen.getByText(
        Config.formation.fields.businessName.header,
      );
      expect(checkAvailableNamesSection).toBeInTheDocument();
    });

    it("if checkNameReservation is 'YES', it shows How Would You Like to Proceed Section", async () => {
      getPageHelper();

      const yesButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.didYouUseFormRadio.option2,
      });
      await userEvent.click(yesButton);

      const howWouldYouLikeToProceed = screen.getByText(
        Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.label,
      );
      expect(howWouldYouLikeToProceed).toBeInTheDocument();
    });

    it("fires name reservation analytics when 'YES' is selected", async () => {
      getPageHelper();

      const yesButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.didYouUseFormRadio.option2,
      });
      await userEvent.click(yesButton);

      expect(
        mockAnalytics.event.formation_task_name_reservation_yes_option.click
          .show_additional_options,
      ).toHaveBeenCalledTimes(1);
    });

    it("if checkNameReservation is 'YES' and howWouldYouLikeToProceed is 'DIFFERENT_NAME' it shows Register With Differnt Name Section", async () => {
      getPageHelper();

      const yesButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.didYouUseFormRadio.option2,
      });
      await userEvent.click(yesButton);

      const differentNameButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.option1,
      });
      await userEvent.click(differentNameButton);

      const registerDifferentNameSection = screen.getByText(
        Config.formation.checkNameReservation.registerDifferentNameHeader,
      );
      expect(registerDifferentNameSection).toBeInTheDocument();
    });

    it("fires different name analytics when 'DIFFERENT_NAME' option is selected", async () => {
      getPageHelper();

      const yesButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.didYouUseFormRadio.option2,
      });
      await userEvent.click(yesButton);

      await screen.findByText(
        Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.label,
      );

      const keepNameButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.option2,
      });
      await userEvent.click(keepNameButton);

      const differentNameButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.option1,
      });
      await userEvent.click(differentNameButton);

      expect(
        mockAnalytics.event.formation_task_name_reservation_different_name_option.click
          .continue_formation_task,
      ).toHaveBeenCalledTimes(1);
    });

    it("if checkNameReservation is 'YES' and howWouldYouLikeToProceed is 'KEEP_NAME' it shows Keep Reserved Name Section", async () => {
      getPageHelper();

      const yesButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.didYouUseFormRadio.option2,
      });
      await userEvent.click(yesButton);

      const keepNameButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.option2,
      });
      await userEvent.click(keepNameButton);

      const keepNameSection = screen.getByText(
        Config.formation.checkNameReservation.keepNameHeader,
      );
      expect(keepNameSection).toBeInTheDocument();
    });

    it("fires keep name analytics when 'KEEP_NAME' option is selected", async () => {
      getPageHelper();

      const yesButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.didYouUseFormRadio.option2,
      });
      await userEvent.click(yesButton);

      const keepNameButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.option2,
      });
      await userEvent.click(keepNameButton);

      expect(
        mockAnalytics.event.formation_task_name_reservation_keep_reservation_option.click
          .instruct_close_formation_task,
      ).toHaveBeenCalledTimes(1);
    });

    it("if checkNameReservation is 'YES' and howWouldYouLikeToProceed is 'CANCEL_NAME' it shows Cancel Name Section", async () => {
      getPageHelper();

      const noButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.didYouUseFormRadio.option2,
      });
      await userEvent.click(noButton);

      const cancelNameButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.option3,
      });
      await userEvent.click(cancelNameButton);

      const cancelNameSection = screen.getByText(
        Config.formation.checkNameReservation.cancelNameHeader,
      );
      expect(cancelNameSection).toBeInTheDocument();
    });

    it("fires cancel name analytics when 'CANCEL_NAME' option is selected", async () => {
      getPageHelper();

      const yesButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.didYouUseFormRadio.option2,
      });
      await userEvent.click(yesButton);

      const cancelNameButton = screen.getByRole("radio", {
        name: Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.option3,
      });
      await userEvent.click(cancelNameButton);

      expect(
        mockAnalytics.event.formation_task_name_reservation_cancel_reservation_option.click
          .continue_formation_task,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("content", () => {
    const domesticTypes: FormationLegalType[] = [
      "limited-liability-company",
      "limited-liability-partnership",
      "limited-partnership",
      "c-corporation",
      "s-corporation",
    ];
    const foreignTypes: FormationLegalType[] = [
      "foreign-limited-liability-company",
      "foreign-limited-liability-partnership",
    ];

    for (const legalStructureId of domesticTypes) {
      it(`uses default content for ${legalStructureId}`, () => {
        const profileData = generateFormationProfileData({
          legalStructureId,
          businessPersona: "STARTING",
        });
        const formationData = {
          formationFormData: generateFormationFormData({}, { legalStructureId }),
          formationResponse: undefined,
          getFilingResponse: undefined,
          completedFilingPayment: false,
          businessNameAvailability: undefined,
          dbaBusinessNameAvailability: undefined,
          lastVisitedPageIndex: 0,
        };

        preparePage({
          business: generateBusiness({ profileData, formationData }),
          displayContent: { formationDbaContent: generateFormationDbaContent({}) },
        });

        expect(screen.getByText(Config.formation.fields.businessName.header)).toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.businessName.overrides.foreign.header),
        ).not.toBeInTheDocument();
      });
    }

    for (const legalStructureId of foreignTypes) {
      it(`uses override content for ${legalStructureId}`, () => {
        const legalStructureWithoutPrefix = legalStructureId.replace(foreignLegalTypePrefix, "");
        const profileData = generateFormationProfileData({
          legalStructureId: legalStructureWithoutPrefix,
          businessPersona: "FOREIGN",
          businessName: "some name",
        });

        preparePage({
          business: generateBusiness({ profileData, formationData: generateEmptyFormationData() }),
          displayContent: { formationDbaContent: generateFormationDbaContent({}) },
        });

        expect(
          screen.getByText(Config.formation.fields.businessName.overrides.foreign.header),
        ).toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.businessName.header),
        ).not.toBeInTheDocument();
      });
    }
  });
});
