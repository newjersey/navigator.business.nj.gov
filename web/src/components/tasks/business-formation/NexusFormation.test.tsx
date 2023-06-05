import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { LookupDbaStepIndexByName } from "@/components/tasks/business-formation/DbaFormationStepsConfiguration";
import { LookupNexusStepIndexByName } from "@/components/tasks/business-formation/NexusFormationStepsConfiguration";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { TasksDisplayContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { generateEmptyFormationData, generateFormationDbaContent } from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  mockApiResponse,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { fillText, searchAndGetValue } from "@/test/helpers/helpersSearchBusinessName";
import { currentUserData } from "@/test/mock/withStatefulUserData";
import {
  defaultDateFormat,
  generateFormationFormData,
  generateFormationSubmitResponse,
  generateUserData,
  getCurrentDate,
  UserData,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();

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
      business_formation_dba_resolution_tab: {
        click: {
          arrive_on_business_formation_dba_resolution_step: jest.fn(),
        },
      },
      business_formation_dba_authorization_tab: {
        click: {
          arrive_on_business_formation_dba_authorization_step: jest.fn(),
        },
      },
      business_formation_dba_resolution_step_continue_button: {
        click: {
          arrive_on_business_formation_dba_resolution_step: jest.fn(),
        },
      },
      business_formation_dba_authorization_step_continue_button: {
        click: {
          arrive_on_business_formation_dba_authorization_step: jest.fn(),
        },
      },
    },
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

const clickBack = (): void => {
  fireEvent.click(screen.getByText(Config.formation.general.previousButtonText));
};
const clickNext = (): void => {
  fireEvent.click(screen.getByText(Config.formation.general.initialNextNexusButtonText));
};

describe("<NexusFormationFlow />", () => {
  let initialUserData: UserData;
  let displayContent: TasksDisplayContent;

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();

    const legalStructureId = "limited-liability-company";
    const profileData = generateFormationProfileData({
      legalStructureId,
      businessPersona: "FOREIGN",
      businessName: "",
      nexusDbaName: "",
      needsNexusDbaName: false,
    });
    const formationData = generateEmptyFormationData();
    displayContent = {
      formationDbaContent: generateFormationDbaContent({}),
    };
    initialUserData = generateUserData({ profileData, formationData });
  });

  it("posts to the api with userData and foreign good standing file", async () => {
    mockApiResponse(
      generateFormationSubmitResponse({
        success: true,
        redirect: "www.example.com",
      })
    );

    const legalStructureId = "c-corporation";
    const profileData = generateFormationProfileData({
      legalStructureId,
      businessPersona: "FOREIGN",
      businessName: "Pizza Joint",
      nexusDbaName: "",
      municipality: undefined,
      needsNexusDbaName: false,
    });
    const formationData = generateEmptyFormationData();
    initialUserData = generateUserData({ profileData, formationData });

    const foreignUserData = generateUserData({
      profileData,
      formationData: {
        ...generateEmptyFormationData(),
        businessNameAvailability: { status: "AVAILABLE", similarNames: [], lastUpdatedTimeStamp: "" },
        formationFormData: generateFormationFormData(
          {
            businessName: "Pizza Joint",
            businessStartDate: getCurrentDate().format(defaultDateFormat),
            willPracticeLaw: false,
          },
          { legalStructureId: "foreign-c-corporation" }
        ),
      },
    });

    const page = preparePage(foreignUserData, displayContent);

    await page.searchBusinessName({ status: "AVAILABLE", similarNames: [], lastUpdatedTimeStamp: "" });
    clickNext();
    await page.stepperClickToBusinessStep();

    const file = new File(["my cool file contents"], "cool.png", { type: "image/png" });
    await page.uploadFile(file);
    await page.completeWillPracticeLaw();
    await page.stepperClickToReviewStep();
    await page.clickSubmit();

    const base64String = Buffer.from("my cool file contents", "utf8").toString("base64");
    const updatedForeignUserData = {
      ...foreignUserData,
      formationData: {
        ...foreignUserData.formationData,
        lastVisitedPageIndex: 4,
      },
    };
    await waitFor(() => {
      expect(mockApi.postBusinessFormation).toHaveBeenCalledWith(
        updatedForeignUserData,
        "http://localhost/",
        {
          fileType: "PNG",
          sizeInBytes: file.size,
          base64Contents: base64String,
          filename: "cool.png",
        }
      );
    });
  });

  describe("name search step", () => {
    it("does not display the stepper on name search", async () => {
      preparePage(initialUserData, displayContent);
      expect(screen.getByTestId("nexus-name-step")).toBeInTheDocument();
      expect(screen.queryByTestId("stepper-0")).not.toBeInTheDocument();
    });

    it("does not display buttons on name search initially", async () => {
      preparePage(initialUserData, displayContent);
      expect(screen.queryByText(Config.nexusNameSearch.nexusNextButton)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.formation.general.previousButtonText)).not.toBeInTheDocument();
    });
  });

  describe("when in DBA flow", () => {
    let page: FormationPageHelpers;

    beforeEach(async () => {
      page = preparePage(initialUserData, displayContent);
      fillText("My Cool Business");
      await searchAndGetValue({ status: "UNAVAILABLE" });
      fillText("My Cool DBA Name", { dba: true });
      await searchAndGetValue({ status: "AVAILABLE" }, { dba: true });
    });

    describe("navigates to dba resolution step 2", () => {
      beforeEach(async () => {
        clickNext();
      });

      it("renders the correct step", async () => {
        expect(screen.getByTestId("resolution-step")).toBeInTheDocument();
        expect(
          mockAnalytics.event.business_formation_dba_resolution_step_continue_button.click
            .arrive_on_business_formation_dba_resolution_step
        ).toHaveBeenCalled();
      });

      it("navigates back to name search and resets nameAvailability", async () => {
        clickBack();
        expect(screen.getByTestId("nexus-name-step")).toBeInTheDocument();
        expect(screen.queryByText(Config.nexusNameSearch.nexusNextButton)).not.toBeInTheDocument();
      });

      it("navigates back to name search on stepper click", async () => {
        fireEvent.click(screen.getByTestId(`stepper-${LookupDbaStepIndexByName("Business Name")}`));
        expect(screen.getByTestId("nexus-name-step")).toBeInTheDocument();
      });

      it("marks step 1 complete in  stepper", async () => {
        expect(page.getStepStateInStepper(LookupDbaStepIndexByName("Business Name"))).toEqual("COMPLETE");
      });

      it("marks step 2 active in  stepper", async () => {
        expect(page.getStepStateInStepper(LookupDbaStepIndexByName("DBA Resolution"))).toEqual(
          "INCOMPLETE-ACTIVE"
        );
      });
    });

    describe("navigates to business authorization step 3 from step 2", () => {
      beforeEach(async () => {
        clickNext();
      });

      it("renders the correct step on next button click", async () => {
        clickNext();
        expect(screen.getByTestId("authorization-step")).toBeInTheDocument();
        expect(
          mockAnalytics.event.business_formation_dba_authorization_step_continue_button.click
            .arrive_on_business_formation_dba_authorization_step
        ).toHaveBeenCalled();
      });

      it("navigates back to business authorization step 3 on stepper click", async () => {
        fireEvent.click(screen.getByTestId(`stepper-${LookupDbaStepIndexByName("Authorize Business")}`));
        expect(screen.getByTestId("authorization-step")).toBeInTheDocument();
        expect(
          mockAnalytics.event.business_formation_dba_authorization_tab.click
            .arrive_on_business_formation_dba_authorization_step
        ).toHaveBeenCalled();
      });

      it("navigates back to dba resolution step 2 on stepper click", async () => {
        fireEvent.click(screen.getByTestId(`stepper-${LookupDbaStepIndexByName("DBA Resolution")}`));
        expect(screen.getByTestId("resolution-step")).toBeInTheDocument();
        expect(
          mockAnalytics.event.business_formation_dba_resolution_tab.click
            .arrive_on_business_formation_dba_resolution_step
        ).toHaveBeenCalled();
      });

      it("navigates back to dba resolution step 2 on back button click", async () => {
        clickNext();
        clickBack();
        expect(screen.getByTestId("resolution-step")).toBeInTheDocument();
      });

      it("marks step 2 complete in  stepper", async () => {
        clickNext();
        expect(page.getStepStateInStepper(LookupDbaStepIndexByName("DBA Resolution"))).toEqual("COMPLETE");
      });

      it("marks step 3 active in  stepper", async () => {
        clickNext();
        expect(page.getStepStateInStepper(LookupDbaStepIndexByName("Authorize Business"))).toEqual(
          "INCOMPLETE-ACTIVE"
        );
      });

      it("shows modal when clicking CTA", () => {
        clickNext();
        fireEvent.click(screen.getByText(displayContent.formationDbaContent.Authorize.callToActionText));
        expect(screen.getByText(Config.DbaFormationTask.dbaCtaModalHeader)).toBeInTheDocument();
        expect(screen.getByText(Config.DbaFormationTask.dbaCtaModalContinueButtonText)).toBeInTheDocument();
        expect(screen.getByText(Config.DbaFormationTask.dbaCtaModalCancelButtonText)).toBeInTheDocument();
      });
    });
  });

  describe("when in formation flow", () => {
    let page: FormationPageHelpers;

    describe("when feature flag is set", () => {
      describe("business name step", () => {
        beforeEach(async () => {
          page = preparePage(initialUserData, displayContent);
        });

        it("saves name to formation data", async () => {
          fillText("Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          clickNext();
          expect(currentUserData().formationData.formationFormData.businessName).toEqual("Pizza Joint");
          await page.stepperClickToNexusBusinessNameStep();
          expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
            "Pizza Joint"
          );
        });

        it("saves availablity state when switching back to step", async () => {
          fillText("Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          await screen.findByTestId("available-text");
          expect(screen.getByTestId("available-text").innerHTML.includes("Pizza Joint")).toBeTruthy();
          clickNext();
          await page.stepperClickToNexusBusinessNameStep();
          expect(screen.getByTestId("available-text")).toBeInTheDocument();
          expect(screen.getByTestId("available-text").innerHTML.includes("Pizza Joint")).toBeTruthy();
        });

        it("goes back to nexus name step on back button", async () => {
          fillText("Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          clickNext();
          await screen.findByTestId("formation-form");
          clickBack();
          expect(screen.getByTestId("nexus-name-step")).toBeInTheDocument();
        });

        it("saves name to profile when available", async () => {
          fillText("Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          await screen.findByTestId("available-text");
          expect(currentUserData().profileData.businessName).toEqual("Pizza Joint");
        });

        it("marks step one as complete if business name is available", async () => {
          fillText("Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          clickNext();
          expect(page.getStepStateInStepper(LookupStepIndexByName("Name"))).toEqual("COMPLETE");
        });
      });

      describe("when in guest mode", () => {
        const guestModeNextButtonText = `Register & ${Config.formation.general.initialNextButtonText}`;
        let setRegistrationModalIsVisible: jest.Mock;

        beforeEach(() => {
          setRegistrationModalIsVisible = jest.fn();
          page = preparePage(
            initialUserData,
            displayContent,
            undefined,
            undefined,
            IsAuthenticated.FALSE,
            setRegistrationModalIsVisible
          );
        });

        it("prepends register to the next button on first step", async () => {
          fillText("Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          expect(screen.getByText(guestModeNextButtonText)).toBeInTheDocument();
        });

        it("shows registration modal when clicking continue button from step one", async () => {
          fillText("Pizza Joint");
          await page.searchBusinessName({ status: "AVAILABLE" });
          fireEvent.click(screen.getByText(guestModeNextButtonText));
          expect(setRegistrationModalIsVisible).toHaveBeenCalled();
          expect(screen.queryByTestId("business-step")).not.toBeInTheDocument();
        });
      });
    });

    describe("when feature flag is not set", () => {
      beforeEach(async () => {
        process.env.FEATURE_BUSINESS_FLC = "false";
        page = preparePage(initialUserData, {
          ...displayContent,
          formationDbaContent: {
            ...displayContent.formationDbaContent,
            Formation: {
              ...displayContent.formationDbaContent.Formation,
              contentMd: "roflcopter",
              callToActionText: "buttonText",
            },
          },
        });
        fillText("My Cool Business");
        await searchAndGetValue({ status: "AVAILABLE" });
        clickNext();
      });

      afterEach(() => {
        process.env.FEATURE_BUSINESS_FLC = "true";
      });

      it("displays formationTask content", async () => {
        expect(screen.getByText("roflcopter")).toBeInTheDocument();
        expect(screen.getByText("buttonText")).toBeInTheDocument();
      });

      it("navigates back to name search on stepper click", async () => {
        fireEvent.click(screen.getByTestId(`stepper-${LookupNexusStepIndexByName("Business Name")}`));
        expect(screen.getByTestId("nexus-name-step")).toBeInTheDocument();
      });

      it("marks step 1 complete in  stepper", async () => {
        expect(page.getStepStateInStepper(LookupNexusStepIndexByName("Business Name"))).toEqual("COMPLETE");
      });

      it("marks step 2 active in  stepper", async () => {
        expect(page.getStepStateInStepper(LookupNexusStepIndexByName("Authorize Business"))).toEqual(
          "INCOMPLETE-ACTIVE"
        );
      });
    });
  });
});
