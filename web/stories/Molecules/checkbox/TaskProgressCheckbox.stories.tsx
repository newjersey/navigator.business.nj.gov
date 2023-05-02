import { TaskProgressCheckbox } from "@/components/TaskProgressCheckbox";
import { Checkbox } from "@mui/material";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Molecules/Checkbox",
  component: TaskProgressCheckbox,
  decorators: [
    (Story) => {
      return <div>{Story()}</div>;
    },
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2854%3A6171&t=QO1bUJjZkHWR2jgl-1",
    },
  },
} as ComponentMeta<typeof Checkbox>;

const TaskProgressCheckboxStory: ComponentStory<typeof TaskProgressCheckbox> = (args) => {
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
          taskId={`1`}
          STORYBOOK_ONLY_currentTaskProgress={"NOT_STARTED"}
        />
      </div>
      <div className={"margin-bottom-2"}>
        <TaskProgressCheckbox
          disabledTooltipText={undefined}
          taskId={`1`}
          STORYBOOK_ONLY_currentTaskProgress={"IN_PROGRESS"}
        />
      </div>
      <div className={"margin-bottom-2"}>
        <TaskProgressCheckbox
          disabledTooltipText={"disabled text"}
          taskId={`1`}
          STORYBOOK_ONLY_currentTaskProgress={"IN_PROGRESS"}
        />
      </div>
      <div className={"margin-bottom-2"}>
        <TaskProgressCheckbox
          disabledTooltipText={undefined}
          taskId={`1`}
          STORYBOOK_ONLY_currentTaskProgress={"COMPLETED"}
        />
      </div>
      <div className={"margin-bottom-2"}>
        <TaskProgressCheckbox
          disabledTooltipText={"disabled text"}
          taskId={`1`}
          STORYBOOK_ONLY_currentTaskProgress={"COMPLETED"}
        />
      </div>
    </>
  );
};

export const TaskCompletionCheckbox = TaskProgressCheckboxStory.bind({});
