import { Roadmap } from "@/components/dashboard/Roadmap";
import { getMergedConfig } from "@/contexts/configContext";
import {
  generateTask,
  operatingPhasesDisplayingBusinessStructurePrompt,
  operatingPhasesNotDisplayingBusinessStructurePrompt,
} from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import {
  businessStructureTaskId,
  generateBusiness,
  generateProfileData,
  generateUserData,
} from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));

describe("<Roadmap />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    useMockRouter({});
  });

  const Config = getMergedConfig();
  const userData = generateUserData({});

  describe.each(operatingPhasesDisplayingBusinessStructurePrompt)(
    "BusinessStructurePrompt",
    (operatingPhase) => {
      beforeEach(() => {
        useMockBusiness(
          generateBusiness(userData, { profileData: generateProfileData({ operatingPhase: operatingPhase }) })
        );
      });

      describe(`${operatingPhase}`, () => {
        it("renders the roadmap with the business structure prompt", () => {
          render(<Roadmap />);
          expect(screen.getByTestId("business-structure-prompt")).toBeInTheDocument();
        });

        it("routes user to task page on button click", () => {
          useMockRoadmap({
            tasks: [generateTask({ id: businessStructureTaskId, urlSlug: "business-structure-url-slug" })],
          });
          render(<Roadmap />);
          fireEvent.click(screen.getByText(Config.businessStructurePrompt.buttonText));
          expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/business-structure-url-slug");
        });
      });
    }
  );

  test.each(operatingPhasesNotDisplayingBusinessStructurePrompt)(
    "does not render the roadmap with the business structure prompt for %p",
    (operatingPhase) => {
      useMockBusiness(
        generateBusiness(userData, { profileData: generateProfileData({ operatingPhase: operatingPhase }) })
      );
      render(<Roadmap />);
      expect(screen.queryByTestId("business-structure-prompt")).not.toBeInTheDocument();
    }
  );
});
