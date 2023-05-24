import { Roadmap } from "@/components/dashboard/Roadmap";
import { getMergedConfig } from "@/contexts/configContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { generateProfileData, generateUserData, OperatingPhases } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const operatingPhasesDisplayingBusinessStructurePrompt = OperatingPhases.filter(
  (phase) => phase.displayBusinessStructurePrompt
).map((phase) => phase.id);

const operatingPhasesNotDisplayingBusinessStructurePrompt = OperatingPhases.filter(
  (phase) => !phase.displayBusinessStructurePrompt
).map((phase) => phase.id);

describe("<SectionAccordion />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    useMockRouter({});
  });

  const Config = getMergedConfig();

  describe.each(operatingPhasesDisplayingBusinessStructurePrompt)(
    "BusinessStructurePrompt",
    (operatingPhase) => {
      beforeEach(() => {
        useMockUserData(
          generateUserData({ profileData: generateProfileData({ operatingPhase: operatingPhase }) })
        );
      });

      describe(`${operatingPhase}`, () => {
        it("renders the roadmap with the business structure prompt", () => {
          render(<Roadmap />);
          expect(screen.getByTestId("business-structure-prompt")).toBeInTheDocument();
        });

        it("routes user to task page on button click", () => {
          render(<Roadmap />);
          fireEvent.click(screen.getByText(Config.businessStructurePrompt.buttonText));
          expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.businessStructureTask);
        });
      });
    }
  );

  test.each(operatingPhasesNotDisplayingBusinessStructurePrompt)(
    "does not render the roadmap with the business structure prompt for %p",
    (operatingPhase) => {
      useMockUserData(
        generateUserData({ profileData: generateProfileData({ operatingPhase: operatingPhase }) })
      );
      render(<Roadmap />);
      expect(screen.queryByTestId("business-structure-prompt")).not.toBeInTheDocument();
    }
  );
});
