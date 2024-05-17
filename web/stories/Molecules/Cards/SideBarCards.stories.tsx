import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { generateSidebarCardContent } from "@/test/factories";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SidebarCardGeneric> = {
  title: "Molecules/Cards/SideBarCards",
  component: SidebarCardGeneric,
  decorators: [(Story) => <div className="width-mobile-lg">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=3266-13862&mode=design&t=3BT1qFE9mGxbn6Ko-0",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SidebarCardGeneric>;

export const FormationNudge: Story = {
  args: {
    card: generateSidebarCardContent({
      contentMd: "Formation Card Body Text",
      header: "Formation Card",
      id: "formation-nudge",
    }),
    ctaOnClick: () => {},
  },
};

export const FundingNudge: Story = {
  args: {
    card: generateSidebarCardContent({
      contentMd: "Funding Card Body Text",
      header: "Funding Card",
      id: "funding-nudge",
    }),
    ctaOnClick: () => {},
  },
};

export const NotRegistered: Story = {
  args: {
    card: generateSidebarCardContent({
      contentMd: "Not Registered",
      header: "Not Registered",
      id: "not-registered",
    }),
    ctaOnClick: () => {},
  },
};

export const GoToProfile: Story = {
  args: {
    card: generateSidebarCardContent({
      contentMd: "Card Body Text",
      header: "Go to Profile",
      id: "go-to-profile",
      preBodySpanButtonText: "Go to Your Profile",
    }),
    ctaOnClick: () => {},
  },
};
