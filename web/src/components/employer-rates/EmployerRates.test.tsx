import { EmployerRates } from "@/components/employer-rates/EmployerRates";
import { useMockProfileData } from "@/test/mock/mockUseUserData";
import { getMergedConfig, OperatingPhaseId } from "@businessnjgovnavigator/shared";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const Config = getMergedConfig();
const originalOpen = window.open;

describe("EmployerRates", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  it("renders for up and running operating phase for starting persona", () => {
    useMockProfileData({
      operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
      businessPersona: "STARTING",
    });
    render(<EmployerRates />);
    expect(screen.getByText(Config.employerRates.sectionHeaderText)).toBeInTheDocument();
  });

  it("renders for up and running operating phase for foreign persona", () => {
    useMockProfileData({
      operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
      businessPersona: "FOREIGN",
    });
    render(<EmployerRates />);
    expect(screen.getByText(Config.employerRates.sectionHeaderText)).toBeInTheDocument();
  });

  it("renders for up and running owning operating phase", () => {
    useMockProfileData({
      operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
      businessPersona: "OWNING",
    });
    render(<EmployerRates />);
    expect(screen.getByText(Config.employerRates.sectionHeaderText)).toBeInTheDocument();
  });

  describe("employerAccessRegistration Input", () => {
    it("doet not have a default value for employerAccessRegistration when undefined", () => {
      useMockProfileData({
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
        businessPersona: "OWNING",
        employerAccessRegistration: undefined,
      });
      render(<EmployerRates />);

      const falseRadio = screen.getByRole("radio", {
        name: Config.employerRates.employerAccessFalseText,
      });
      const trueRadio = screen.getByRole("radio", {
        name: Config.employerRates.employerAccessTrueText,
      });
      expect(falseRadio).not.toBeChecked();
      expect(trueRadio).not.toBeChecked();
    });

    it("renders false when employerAccessRegistration is false", () => {
      useMockProfileData({
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
        businessPersona: "OWNING",
        employerAccessRegistration: false,
      });
      render(<EmployerRates />);

      const falseRadio = screen.getByRole("radio", {
        name: Config.employerRates.employerAccessFalseText,
      });
      expect(falseRadio).toBeChecked();
    });

    it("renders true when employerAccessRegistration is true", () => {
      useMockProfileData({
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
        businessPersona: "OWNING",
        employerAccessRegistration: true,
      });
      render(<EmployerRates />);

      const trueRadio = screen.getByRole("radio", {
        name: Config.employerRates.employerAccessTrueText,
      });
      expect(trueRadio).toBeChecked();
    });
  });

  it("opens link when clicking the employerAccessNoButtonText button", async () => {
    (window as Window & typeof globalThis).open = jest.fn();
    useMockProfileData({
      operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
      businessPersona: "OWNING",
      employerAccessRegistration: false,
    });

    render(<EmployerRates />);

    const button = screen.getByRole("button", {
      name: Config.employerRates.employerAccessNoButtonText,
    });

    await userEvent.click(button);

    expect(window.open).toHaveBeenCalledWith(
      Config.employerRates.employerAccessNoButtonLink,
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("renders button that calls api", async () => {
    useMockProfileData({
      operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
      businessPersona: "OWNING",
      employerAccessRegistration: true,
    });

    render(<EmployerRates />);

    await waitFor(() => {
      expect(
        screen.getByText(Config.employerRates.employerAccessYesButtonText),
      ).toBeInTheDocument();
    });
  });
});
