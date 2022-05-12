import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateFormationDisplayContent, generateTask, generateUserData } from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import {
  createFormationPageHelpers,
  FormationPageHelpers,
  generateLLCProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import { currentUserData, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { createEmptyFormationFormData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - BusinessNameSection", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = (initialBusinessName?: string): FormationPageHelpers => {
    const profileData = initialBusinessName
      ? generateLLCProfileData({ businessName: initialBusinessName })
      : generateLLCProfileData({});
    const formationData = {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    return preparePage(generateUserData({ profileData, formationData }), generateFormationDisplayContent({}));
  };

  it("pre-fills the text field with the business name from profile", () => {
    getPageHelper("My Restaurant");
    expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My Restaurant"
    );
  });

  it("overrides the text field's initial value if user types in field", () => {
    const page = getPageHelper("My Restaurant");
    expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My Restaurant"
    );

    page.fillText("Search business name", "My New Restaurant");
    expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My New Restaurant"
    );
  });

  it("displays continue button on business name tab only once name is available", async () => {
    const page = getPageHelper();
    expect(screen.queryByText(Config.businessFormationDefaults.initialNextButtonText)).not.toBeVisible();

    page.fillText("Search business name", "My taken test business");
    await page.searchBusinessName({ status: "UNAVAILABLE" });
    expect(screen.queryByText(Config.businessFormationDefaults.initialNextButtonText)).not.toBeVisible();

    page.fillText("Search business name", "My test business");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(screen.getByText(Config.businessFormationDefaults.initialNextButtonText)).toBeVisible();

    page.fillText("Search business name", "Anything");
    await page.searchBusinessNameAndGetError();
    expect(screen.queryByText(Config.businessFormationDefaults.initialNextButtonText)).not.toBeVisible();
  });

  it("saves business name to profile after clicking continue", async () => {
    const page = getPageHelper();
    await page.submitBusinessNameTab("My Test Business");
    await waitFor(() => expect(currentUserData().profileData.businessName).toEqual("My Test Business"));
  });

  it("does not display continue button and available alert if user types in new name after finding an available one", async () => {
    const page = getPageHelper();
    expect(screen.queryByText(Config.businessFormationDefaults.initialNextButtonText)).not.toBeVisible();

    page.fillText("Search business name", "First Name");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(screen.getByText(Config.businessFormationDefaults.initialNextButtonText)).toBeVisible();
    expect(screen.getByTestId("available-text")).toBeInTheDocument();

    page.fillText("Search business name", "Second Name");
    expect(screen.queryByText(Config.businessFormationDefaults.initialNextButtonText)).not.toBeVisible();
    expect(screen.queryByTestId("available-text")).not.toBeInTheDocument();
  });

  it("shows available text if name is available", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(screen.getByTestId("available-text")).toBeInTheDocument();
    expect(screen.queryByTestId("unavailable-text")).not.toBeInTheDocument();
  });

  it("shows unavailable text if name is not available", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "UNAVAILABLE" });
    expect(screen.getByTestId("unavailable-text")).toBeInTheDocument();
    expect(screen.queryByTestId("available-text")).not.toBeInTheDocument();
  });

  it("shows similar unavailable names when not available", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "UNAVAILABLE", similarNames: ["Rusty's Pizza", "Pizzapizza"] });
    expect(screen.getByText("Rusty's Pizza")).toBeInTheDocument();
    expect(screen.getByText("Pizzapizza")).toBeInTheDocument();
  });

  it("shows validation error if user searches with empty name", async () => {
    const page = getPageHelper();

    fireEvent.change(screen.getByLabelText("Search business name"), { target: { value: "" } });
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(screen.getByText("You need to enter a business name to check availability.")).toBeInTheDocument();

    page.fillText("Search business name", "Anything");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(
      screen.queryByText("You need to enter a business name to check availability.")
    ).not.toBeInTheDocument();
  });

  it("shows validation error but no error alert if user blurs with empty name", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "");
    expect(screen.getByText("You need to enter a business name to check availability.")).toBeInTheDocument();

    page.fillText("Search business name", "Anything");
    expect(
      screen.queryByText("You need to enter a business name to check availability.")
    ).not.toBeInTheDocument();
  });

  it("shows message if search returns 400", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "LLC");
    await page.searchBusinessNameAndGetError(400);
    expect(screen.getByTestId("error-alert-BAD_INPUT")).toBeInTheDocument();

    page.fillText("Search business name", "LLCA");
    await page.searchBusinessName({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-BAD_INPUT")).not.toBeInTheDocument();
  });

  it("shows error if search fails with 500", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Anything");
    await page.searchBusinessNameAndGetError(500);
    expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
    page.fillText("Search business name", "Anything else");
    await page.searchBusinessName({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
  });

  it("opens registration modal when guest mode user tries to continue", async () => {
    const initialUserData = generateUserData({
      formationData: {
        formationFormData: createEmptyFormationFormData(),
        formationResponse: undefined,
        getFilingResponse: undefined,
      },
      profileData: generateLLCProfileData({}),
    });

    const setModalIsVisible = jest.fn();

    render(
      withAuthAlert(
        <WithStatefulUserData initialUserData={initialUserData}>
          <ThemeProvider theme={createTheme()}>
            <BusinessFormation
              task={generateTask({})}
              displayContent={generateFormationDisplayContent({})}
              municipalities={[]}
            />
          </ThemeProvider>
        </WithStatefulUserData>,
        IsAuthenticated.FALSE,
        { modalIsVisible: false, setModalIsVisible }
      )
    );
    const page = createFormationPageHelpers();

    page.fillText("Search business name", "My test business");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(setModalIsVisible).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.initialNextButtonText));
    expect(setModalIsVisible).toHaveBeenCalledWith(true);
  });

  it("displays dependency alert", async () => {
    getPageHelper();
    expect(screen.getByTestId("dependency-alert")).toBeInTheDocument();
  });
});
