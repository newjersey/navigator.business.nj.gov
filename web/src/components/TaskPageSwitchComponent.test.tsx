import { TaskPageSwitchComponent } from "@/components/TaskPageSwitchComponent";
import { generateFormationDbaContent, generateRoadmap, generateTask } from "@/test/factories";
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
      formationDbaContent: generateFormationDbaContent({}),
    };

    it("renders multi step cigarette task when true", () => {
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

    it("renders static content cigarette task when not true", () => {
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
