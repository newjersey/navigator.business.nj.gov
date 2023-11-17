import { TaskProgressCheckbox } from "@/components/TaskProgressCheckbox";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => {
  return (
    <>
      <div className={"margin-bottom-2"}>
        <TaskProgressCheckbox
          disabledTooltipText={undefined}
          taskId={`1`}
          STORYBOOK_ONLY_currentTaskProgress={"NOT_STARTED"}
        />
      </div>
      <div className={"margin-bottom-2"}>
        <TaskProgressCheckbox
          disabledTooltipText={"disabled text"}
          taskId={`2`}
          STORYBOOK_ONLY_currentTaskProgress={"NOT_STARTED"}
        />
      </div>
      <div className={"margin-bottom-2"}>
        <TaskProgressCheckbox
          disabledTooltipText={undefined}
          taskId={`3`}
          STORYBOOK_ONLY_currentTaskProgress={"IN_PROGRESS"}
        />
      </div>
      <div className={"margin-bottom-2"}>
        <TaskProgressCheckbox
          disabledTooltipText={"disabled text"}
          taskId={`4`}
          STORYBOOK_ONLY_currentTaskProgress={"IN_PROGRESS"}
        />
      </div>
      <div className={"margin-bottom-2"}>
        <TaskProgressCheckbox
          disabledTooltipText={undefined}
          taskId={`5`}
          STORYBOOK_ONLY_currentTaskProgress={"COMPLETED"}
        />
      </div>
      <div className={"margin-bottom-2"}>
        <TaskProgressCheckbox
          disabledTooltipText={"disabled text"}
          taskId={`6`}
          STORYBOOK_ONLY_currentTaskProgress={"COMPLETED"}
        />
      </div>
    </>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/Checkbox",
  component: Template,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2854%3A6171&t=QO1bUJjZkHWR2jgl-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Template>;

export const TaskCompletionCheckbox: Story = {};
