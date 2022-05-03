import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateFormationDisplayContent, generateTask, generateUserData } from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import {
  createFormationPageHelpers,
  generateLLCProfileData,
  RenderedTask,
  renderTask,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import { currentUserData, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { createEmptyFormationFormData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, waitFor } from "@testing-library/react";
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

  const renderSection = (initialBusinessName?: string): RenderedTask => {
    const profileData = initialBusinessName
      ? generateLLCProfileData({ businessName: initialBusinessName })
      : generateLLCProfileData({});
    const formationData = {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    return renderTask(generateUserData({ profileData, formationData }), generateFormationDisplayContent({}));
  };

  it("pre-fills the text field with the business name from profile", () => {
    const { subject } = renderSection("My Restaurant");
    expect((subject.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My Restaurant"
    );
  });

  it("overrides the text field's initial value if user types in field", () => {
    const { subject, page } = renderSection("My Restaurant");
    expect((subject.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My Restaurant"
    );

    page.fillText("Search business name", "My New Restaurant");
    expect((subject.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My New Restaurant"
    );
  });

  it("displays continue button on business name tab only once name is available", async () => {
    const { subject, page } = renderSection();
    expect(subject.queryByText(Config.businessFormationDefaults.initialNextButtonText)).not.toBeVisible();

    page.fillText("Search business name", "My taken test business");
    await page.searchBusinessName({ status: "UNAVAILABLE" });
    expect(subject.queryByText(Config.businessFormationDefaults.initialNextButtonText)).not.toBeVisible();

    page.fillText("Search business name", "My test business");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(subject.getByText(Config.businessFormationDefaults.initialNextButtonText)).toBeVisible();

    page.fillText("Search business name", "Anything");
    await page.searchBusinessNameAndGetError();
    expect(subject.queryByText(Config.businessFormationDefaults.initialNextButtonText)).not.toBeVisible();
  });

  it("saves business name to profile after clicking continue", async () => {
    const { page } = renderSection();
    await page.submitBusinessNameTab("My Test Business");
    await waitFor(() => expect(currentUserData().profileData.businessName).toEqual("My Test Business"));
  });

  it("does not display continue button and available alert if user types in new name after finding an available one", async () => {
    const { subject, page } = renderSection();
    expect(subject.queryByText(Config.businessFormationDefaults.initialNextButtonText)).not.toBeVisible();

    page.fillText("Search business name", "First Name");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(subject.getByText(Config.businessFormationDefaults.initialNextButtonText)).toBeVisible();
    expect(subject.getByTestId("available-text")).toBeInTheDocument();

    page.fillText("Search business name", "Second Name");
    expect(subject.queryByText(Config.businessFormationDefaults.initialNextButtonText)).not.toBeVisible();
    expect(subject.queryByTestId("available-text")).not.toBeInTheDocument();
  });

  it("shows available text if name is available", async () => {
    const { subject, page } = renderSection();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(subject.getByTestId("available-text")).toBeInTheDocument();
    expect(subject.queryByTestId("unavailable-text")).not.toBeInTheDocument();
  });

  it("shows unavailable text if name is not available", async () => {
    const { subject, page } = renderSection();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "UNAVAILABLE" });
    expect(subject.getByTestId("unavailable-text")).toBeInTheDocument();
    expect(subject.queryByTestId("available-text")).not.toBeInTheDocument();
  });

  it("shows similar unavailable names when not available", async () => {
    const { subject, page } = renderSection();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "UNAVAILABLE", similarNames: ["Rusty's Pizza", "Pizzapizza"] });
    expect(subject.queryByText("Rusty's Pizza")).toBeInTheDocument();
    expect(subject.queryByText("Pizzapizza")).toBeInTheDocument();
  });

  it("shows validation error if user searches with empty name", async () => {
    const { subject, page } = renderSection();

    fireEvent.change(subject.getByLabelText("Search business name"), { target: { value: "" } });
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(subject.getByText("You need to enter a business name to check availability.")).toBeInTheDocument();

    page.fillText("Search business name", "Anything");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(
      subject.queryByText("You need to enter a business name to check availability.")
    ).not.toBeInTheDocument();
  });

  it("shows validation error but no error alert if user blurs with empty name", async () => {
    const { subject, page } = renderSection();

    page.fillText("Search business name", "");
    expect(subject.getByText("You need to enter a business name to check availability.")).toBeInTheDocument();

    page.fillText("Search business name", "Anything");
    expect(
      subject.queryByText("You need to enter a business name to check availability.")
    ).not.toBeInTheDocument();
  });

  it("shows message if search returns 400", async () => {
    const { subject, page } = renderSection();

    page.fillText("Search business name", "LLC");
    await page.searchBusinessNameAndGetError(400);
    expect(subject.getByTestId("error-alert-BAD_INPUT")).toBeInTheDocument();

    page.fillText("Search business name", "LLCA");
    await page.searchBusinessName({ status: "AVAILABLE", similarNames: [] });
    expect(subject.queryByTestId("error-alert-BAD_INPUT")).not.toBeInTheDocument();
  });

  it("shows error if search fails with 500", async () => {
    const { subject, page } = renderSection();

    page.fillText("Search business name", "Anything");
    await page.searchBusinessNameAndGetError(500);
    expect(subject.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
    page.fillText("Search business name", "Anything else");
    await page.searchBusinessName({ status: "AVAILABLE", similarNames: [] });
    expect(subject.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
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

    const subject = render(
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
    const page = createFormationPageHelpers(subject);

    page.fillText("Search business name", "My test business");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(setModalIsVisible).not.toHaveBeenCalled();
    fireEvent.click(subject.getByText(Config.businessFormationDefaults.initialNextButtonText));
    expect(setModalIsVisible).toHaveBeenCalledWith(true);
  });

  it("displays dependency alert", async () => {
    const { subject } = renderSection();
    expect(subject.queryByTestId("dependency-alert")).toBeInTheDocument();
  });
});
