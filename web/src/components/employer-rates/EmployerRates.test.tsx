import { EmployerRates } from "@/components/employer-rates/EmployerRates";
import { useMockProfileData } from "@/test/mock/mockUseUserData";
import { getMergedConfig, OperatingPhaseId } from "@businessnjgovnavigator/shared";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const Config = getMergedConfig();

describe("EmployerRates", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders for up and running operating phase", () => {
    useMockProfileData({
      operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
      businessPersona: "STARTING",
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
});
