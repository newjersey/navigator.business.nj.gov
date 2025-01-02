import { HomeBasedBusiness } from "@/components/data-fields/HomeBasedBusiness";
import { DeferredOnboardingQuestion } from "@/components/DeferredOnboardingQuestion";
import { getMergedConfig } from "@/contexts/configContext";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import { emptyIndustrySpecificData } from "@businessnjgovnavigator/shared/profileData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));

const Config = getMergedConfig();

describe("<DeferredOnboardingQuestion />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRouter({});
  });

  const renderComponent = ({ onSave }: { onSave?: () => void }): void => {
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(
          generateBusiness({ profileData: generateProfileData({ ...emptyIndustrySpecificData }) })
        )}
      >
        <DeferredOnboardingQuestion label="" onSave={onSave || vi.fn()}>
          <HomeBasedBusiness />
        </DeferredOnboardingQuestion>
      </WithStatefulUserData>
    );
  };

  it("saves changes to profile data", () => {
    renderComponent({});
    fireEvent.click(screen.getByTestId("home-based-business-radio-true"));
    fireEvent.click(screen.getByText(Config.deferredLocation.deferredOnboardingSaveButtonText));
    expect(currentBusiness().profileData.homeBasedBusiness).toEqual(true);
  });

  it("calls onSave prop", async () => {
    const onSave = vi.fn();
    renderComponent({ onSave });
    fireEvent.click(screen.getByTestId("home-based-business-radio-true"));
    fireEvent.click(screen.getByText(Config.deferredLocation.deferredOnboardingSaveButtonText));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it("does not update if no answer provided", () => {
    renderComponent({});
    fireEvent.click(screen.getByText(Config.deferredLocation.deferredOnboardingSaveButtonText));
    expect(userDataWasNotUpdated()).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
