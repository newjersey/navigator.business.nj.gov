import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { getMergedConfig } from "@/contexts/configContext";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";
import { generateTask } from "@/test/factories";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

vi.mock("@/lib/data-hooks/useTaskFromRoadmap", () => ({ useTaskFromRoadmap: vi.fn() }));

const fakeTaskFromRoadmap = useTaskFromRoadmap as vi.Mock;

describe("<UnlockedBy />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders <UnlockingAlert />", () => {
    const task = generateTask({});
    fakeTaskFromRoadmap.mockReturnValue(task);
    render(<UnlockedBy task={task} />);

    expect(screen.getByText(Config.taskDefaults.unlockedBySingular)).toBeInTheDocument();
  });

  it("renders <UnlockingAlertDakotaFormation /> if current taskId is form-business-entity and the task is blocked by certificate-good-standing-foreign", () => {
    const task = generateTask({
      id: "form-business-entity",
      unlockedBy: [generateTask({ id: "certificate-good-standing-foreign" })],
    });
    fakeTaskFromRoadmap.mockReturnValue(task);
    render(<UnlockedBy task={task} />);

    const alertMatchedWithStartingText = screen.getByText((content) =>
      content.includes(Config.formation.intro.certificateOfGoodStandingAlert.beginning)
    );

    const alertMatchedWithEndingText = screen.getByText((content) =>
      content.includes(Config.formation.intro.certificateOfGoodStandingAlert.end)
    );

    expect(alertMatchedWithStartingText).toBeInTheDocument();
    expect(alertMatchedWithEndingText).toBeInTheDocument();
  });
});
