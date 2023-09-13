import { PostOnboardingRadioQuestion } from "@/components/post-onboarding/PostOnboardingRadioQuestion";
import * as fetchPostOnboardingModule from "@/lib/async-content-fetchers/fetchPostOnboarding";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generatePostOnboarding } from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/async-content-fetchers/fetchPostOnboarding", () => ({ fetchPostOnboarding: jest.fn() }));
jest.mock("@/lib/domain-logic/postOnboardingCheckboxes", () => {
  return {
    postOnboardingCheckboxes: {
      "some-post-onboarding-id": ["checkbox-1", "checkbox-2"],
    },
  };
});
const mockFetchPostOnboarding = (fetchPostOnboardingModule as jest.Mocked<typeof fetchPostOnboardingModule>)
  .fetchPostOnboarding;

describe("<PostOnboardingRadioQuestion />", () => {
  const postOnboardingQuestionId = "some-post-onboarding-id";
  const taskId = "some-task-id";

  const renderComponent = (initialBusiness: Business, onboardingKey: keyof ProfileData): void => {
    render(
      withNeedsAccountContext(
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(initialBusiness)}>
          <PostOnboardingRadioQuestion
            postOnboardingQuestionId={postOnboardingQuestionId}
            onboardingKey={onboardingKey}
            taskId={taskId}
          />
        </WithStatefulUserData>,
        IsAuthenticated.TRUE
      )
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  it("sets given profileKey based on radio button toggle", async () => {
    const initialBusiness = generateBusiness({
      profileData: generateProfileData({ constructionRenovationPlan: undefined }),
    });

    mockFetchPostOnboarding.mockResolvedValue(generatePostOnboarding({}));
    renderComponent(initialBusiness, "constructionRenovationPlan");

    await waitFor(() => {
      expect(screen.getByTestId(postOnboardingQuestionId)).toBeInTheDocument();
    });

    expect(screen.queryByTestId("post-onboarding-false-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("post-onboarding-true-content")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("post-onboarding-radio-true"));
    expect(screen.queryByTestId("post-onboarding-false-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("post-onboarding-true-content")).toBeInTheDocument();
    expect(currentBusiness().profileData.constructionRenovationPlan).toBe(true);

    fireEvent.click(screen.getByTestId("post-onboarding-radio-false"));
    expect(screen.getByTestId("post-onboarding-false-content")).toBeInTheDocument();
    expect(screen.queryByTestId("post-onboarding-true-content")).not.toBeInTheDocument();

    expect(currentBusiness().profileData.constructionRenovationPlan).toBe(false);
  });

  describe("checkboxes and task status updates", () => {
    const setupAndRenderWithCheckboxes = async (): Promise<void> => {
      const initialBusiness = generateBusiness({
        profileData: generateProfileData({ constructionRenovationPlan: true }),
        taskItemChecklist: {},
        taskProgress: {
          [taskId]: "NOT_STARTED",
        },
      });

      mockFetchPostOnboarding.mockResolvedValue(
        generatePostOnboarding({
          contentMd: "- []{checkbox-1} content1\n" + "- []{checkbox-2} content2\n",
        })
      );

      renderComponent(initialBusiness, "constructionRenovationPlan");
      await waitFor(() => {
        expect(screen.getByTestId(postOnboardingQuestionId)).toBeInTheDocument();
      });
    };

    it("updates task progress to In-Progress if radio is Yes and one or more checkboxes completed", async () => {
      await setupAndRenderWithCheckboxes();
      fireEvent.click(getInputByName("content1"));
      expect(getInputByName("content1").checked).toBe(true);
      expect(currentBusiness().taskItemChecklist["checkbox-1"]).toEqual(true);
      expect(currentBusiness().taskProgress[taskId]).toEqual("IN_PROGRESS");
    });

    it("updates task progress to Completed if radio is Yes and all checkboxes completed", async () => {
      await setupAndRenderWithCheckboxes();
      fireEvent.click(getInputByName("content1"));
      expect(currentBusiness().taskItemChecklist["checkbox-1"]).toEqual(true);
      expect(currentBusiness().taskProgress[taskId]).toEqual("IN_PROGRESS");
      fireEvent.click(getInputByName("content2"));
      expect(currentBusiness().taskItemChecklist["checkbox-2"]).toEqual(true);
      expect(currentBusiness().taskProgress[taskId]).toEqual("COMPLETED");
    });

    it("keeps task progress as In Progress if radio is Yes and no checkboxes completed", async () => {
      await setupAndRenderWithCheckboxes();
      fireEvent.click(getInputByName("content1"));
      expect(currentBusiness().taskItemChecklist["checkbox-1"]).toEqual(true);
      expect(currentBusiness().taskProgress[taskId]).toEqual("IN_PROGRESS");
      fireEvent.click(getInputByName("content1"));
      expect(currentBusiness().taskItemChecklist["checkbox-1"]).toEqual(false);
      expect(currentBusiness().taskProgress[taskId]).toEqual("IN_PROGRESS");
    });

    it("sets task to Completed when radio No is selected", async () => {
      await setupAndRenderWithCheckboxes();
      fireEvent.click(screen.getByTestId("post-onboarding-radio-false"));
      expect(currentBusiness().taskProgress[taskId]).toEqual("COMPLETED");
    });

    it("sets task to In Progress when radio Yes is selected", async () => {
      await setupAndRenderWithCheckboxes();
      fireEvent.click(screen.getByTestId("post-onboarding-radio-false"));
      expect(currentBusiness().taskProgress[taskId]).toEqual("COMPLETED");
      fireEvent.click(screen.getByTestId("post-onboarding-radio-true"));
      expect(currentBusiness().taskProgress[taskId]).toEqual("IN_PROGRESS");
    });

    it("clears checkbox data when radio No is selected", async () => {
      await setupAndRenderWithCheckboxes();
      fireEvent.click(getInputByName("content1"));
      fireEvent.click(screen.getByTestId("post-onboarding-radio-false"));
      expect(currentBusiness().taskItemChecklist["checkbox-1"]).not.toBe(true);
      expect(currentBusiness().taskItemChecklist["checkbox-2"]).not.toBe(true);
    });
  });

  const getInputByName = (name: string): HTMLInputElement => {
    return screen.getByRole("checkbox", { name: name });
  };
});
