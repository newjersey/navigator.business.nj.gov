import { TaskPageSwitchComponent } from "@/components/TaskPageSwitchComponent";
import { generateRoadmap, generateTask } from "@/test/factories";
import { generateBusiness } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";

describe("TaskPageSwitchComponent", () => {
  const initialFeatureCigaretteLicense = process.env.FEATURE_CIGARETTE_LICENSE;

  afterEach(() => {
    process.env.FEATURE_CIGARETTE_LICENSE = initialFeatureCigaretteLicense;
  });

  describe("FEATURE_CIGARETTE_LICENSE feature flag", () => {
    const task = generateTask({ id: "cigarette-license" });
    const roadmap = generateRoadmap({});
    const business = generateBusiness({});

    const displayContent = {
      formationDbaContent: {
        DbaResolution: {
          id: "",
          name: "",
          urlSlug: "",
          callToActionLink: "",
          callToActionText: "",
          summaryDescriptionMd: "",
          contentMd: "",
          required: undefined,
          agencyId: undefined,
          agencyAdditionalContext: undefined,
          formName: undefined,
        },
        Authorize: {
          id: "",
          name: "",
          urlSlug: "",
          callToActionLink: "",
          callToActionText: "",
          summaryDescriptionMd: "",
          contentMd: "",
          required: undefined,
          agencyId: undefined,
          agencyAdditionalContext: undefined,
          formName: undefined,
        },
        Formation: {
          id: "",
          name: "",
          urlSlug: "",
          callToActionLink: "",
          callToActionText: "",
          summaryDescriptionMd: "",
          contentMd: "",
          required: undefined,
          agencyId: undefined,
          agencyAdditionalContext: undefined,
          formName: undefined,
        },
      },
    };

    it("renders tax clearance certificate element when true", () => {
      process.env.FEATURE_CIGARETTE_LICENSE = "true";

      render(
        <TaskPageSwitchComponent
          task={task}
          displayContent={displayContent}
          business={business}
          roadmap={roadmap}
        />,
      );

      const firstTab = screen.getAllByRole("tab")[0];
      expect(firstTab).toHaveAttribute("aria-selected", "true");
    });

    it("does not render tax clearance certificate element when not true", () => {
      process.env.FEATURE_CIGARETTE_LICENSE = "some other string";

      render(
        <TaskPageSwitchComponent
          task={task}
          displayContent={displayContent}
          business={business}
          roadmap={roadmap}
        />,
      );
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    });
  });
});
