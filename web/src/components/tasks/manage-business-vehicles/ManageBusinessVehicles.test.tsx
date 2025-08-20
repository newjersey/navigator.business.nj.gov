import { ManageBusinessVehicles } from "@/components/tasks/manage-business-vehicles/ManageBusinessVehicles";
import { generateTask } from "@/test/factories";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  generateBusiness,
  generateRoadmapTaskData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const Config = getMergedConfig();

describe("<ManageBusinessVehicles />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  const task = generateTask({
    id: "manage-business-vehicles",
    name: "Manage Business Vehicles",
  });

  const theme = createTheme();

  const renderComponent = ({
    business = generateBusiness({
      roadmapTaskData: generateRoadmapTaskData({ manageBusinessVehicles: undefined }),
    }),
  } = {}): void => {
    render(
      <ThemeProvider theme={theme}>
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
          <ManageBusinessVehicles task={task} />
        </WithStatefulUserData>
      </ThemeProvider>,
    );
  };

  const pageLevelAlert = (): HTMLElement => {
    return screen.getByRole("alert");
  };

  const submitButton = (): HTMLElement => {
    return screen.getByRole("button", {
      name: Config.manageBusinessVehicles.saveButtonText,
    });
  };

  it("renders the task header", () => {
    renderComponent();
    expect(screen.getByTestId("manage-business-vehicles-task")).toBeInTheDocument();
  });

  describe("errors", () => {
    it("displays error alert when form is submitted without selecting an option", async () => {
      renderComponent();

      fireEvent.click(submitButton());

      await waitFor(() => {
        expect(pageLevelAlert()).toBeInTheDocument();
      });
      expect(
        within(pageLevelAlert()).getByText(Config.manageBusinessVehicles.pageLevelAlertText),
      ).toBeInTheDocument();
    });

    it("displays inline error message when form is submitted without selecting an option", async () => {
      renderComponent();

      fireEvent.click(submitButton());

      await waitFor(() => {
        expect(screen.getByTestId("manage-business-vehicles-error")).toBeInTheDocument();
      });
    });

    it("removes inline error and error alert when option is selected", async () => {
      renderComponent();

      fireEvent.click(submitButton());

      await waitFor(() => {
        expect(pageLevelAlert()).toBeInTheDocument();
      });
      expect(screen.getByTestId("manage-business-vehicles-error")).toBeInTheDocument();

      fireEvent.click(screen.getByText(Config.manageBusinessVehicles.radioOptionOneText));

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
      expect(screen.queryByTestId("manage-business-vehicles-error")).not.toBeInTheDocument();
    });
  });

  describe("updates userData", () => {
    it("updates task progress to COMPLETED when form is submitted with a selected option", async () => {
      renderComponent();
      const yesOption = screen.getByText(Config.manageBusinessVehicles.radioOptionOneText);
      fireEvent.click(yesOption);
      fireEvent.click(submitButton());

      await waitFor(() => {
        expect(currentBusiness().taskProgress["manage-business-vehicles"]).toBe("COMPLETED");
      });
    });

    it("updates manageBusinessVehicles value to true when form is submitted with the yes option selected", async () => {
      renderComponent();
      const yesOption = screen.getByText(Config.manageBusinessVehicles.radioOptionOneText);
      fireEvent.click(yesOption);
      fireEvent.click(submitButton());

      await waitFor(() => {
        expect(currentBusiness().roadmapTaskData?.manageBusinessVehicles).toBe(true);
      });
    });

    it("updates manageBusinessVehicles value to true when form is submitted with the no option selected", async () => {
      renderComponent();
      const noOption = screen.getByText(Config.manageBusinessVehicles.radioOptionTwoText);
      fireEvent.click(noOption);
      fireEvent.click(submitButton());

      await waitFor(() => {
        expect(currentBusiness().roadmapTaskData?.manageBusinessVehicles).toBe(false);
      });
    });

    it("resets to first screen and userData when Edit button is clicked", async () => {
      renderComponent();
      const yesOption = screen.getByText(Config.manageBusinessVehicles.radioOptionOneText);
      fireEvent.click(yesOption);
      fireEvent.click(submitButton());

      await waitFor(() => {
        expect(screen.getByTestId("yesResponseText")).toBeInTheDocument();
      });
      expect(currentBusiness().taskProgress["manage-business-vehicles"]).toBe("COMPLETED");
      expect(currentBusiness().roadmapTaskData?.manageBusinessVehicles).toBe(true);

      const editButton = screen.getByText(Config.manageBusinessVehicles.successAlertButtonText);
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(currentBusiness().taskProgress["manage-business-vehicles"]).toBe("TO_DO");
      });
      expect(currentBusiness().roadmapTaskData?.manageBusinessVehicles).toBeUndefined();

      expect(screen.getByText(Config.manageBusinessVehicles.radioQuestionText)).toBeInTheDocument();
      expect(screen.getByText(Config.manageBusinessVehicles.saveButtonText)).toBeInTheDocument();
      expect(screen.queryByTestId("yesResponseText")).not.toBeInTheDocument();
      expect(screen.queryByTestId("noResponseText")).not.toBeInTheDocument();
    });
  });

  it("displays yesResponseText when yes is selected on the first screen", async () => {
    renderComponent();
    const yesOption = screen.getByText(Config.manageBusinessVehicles.radioOptionOneText);
    fireEvent.click(yesOption);
    fireEvent.click(submitButton());
    await waitFor(() => {
      expect(screen.getByTestId("yesResponseText")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("noResponseText")).not.toBeInTheDocument();
  });

  it("displays noResponseText when no is selected on the first screen", async () => {
    renderComponent();
    const noOption = screen.getByText(Config.manageBusinessVehicles.radioOptionTwoText);
    fireEvent.click(noOption);
    fireEvent.click(submitButton());
    await waitFor(() => {
      expect(screen.getByTestId("noResponseText")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("yesResponseText")).not.toBeInTheDocument();
  });

  it("displays tooltip when hovering over disabled checkbox", async () => {
    renderComponent();
    const user = userEvent.setup();
    const checkbox = screen.getByRole("checkbox");
    await user.hover(checkbox);

    await waitFor(() => {
      expect(screen.getByText(Config.manageBusinessVehicles.tooltipText)).toBeInTheDocument();
    });
  });
});
