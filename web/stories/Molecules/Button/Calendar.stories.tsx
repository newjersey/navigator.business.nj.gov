import { CalendarEventItem } from "@/components/filings-calendar/CalendarEventItem";
import { defaultDateFormat, parseDateWithFormat } from "@businessnjgovnavigator/shared";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof CalendarEventItem> = {
  title: "Molecules/Button/Calendar",
  component: CalendarEventItem,
  decorators: [(Story) => <div style={{ width: "212px", height: "54px" }}>{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarEventItem>;

const currentDate = parseDateWithFormat(`2024-02-15`, "YYYY-MM-DD");
export const Regular: Story = {
  args: {
    urlSlug: "exampleurlslug",
    dueDate: currentDate.format(defaultDateFormat),
    title: "9-1-1 System and Emergency Response Assessment",
    index: undefined,
  },
};
