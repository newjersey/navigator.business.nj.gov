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
      id: "formation-nudge",
      contentMd: "Formation Card Body Text",
      header: "Formation Card",
    }),
    ctaOnClick: () => {},
  },
};

export const FundingNudge: Story = {
  args: {
    card: generateSidebarCardContent({
      id: "funding-nudge",
      contentMd: "Funding Card Body Text",
      header: "Funding Card",
    }),
    ctaOnClick: () => {},
  },
};

export const NotRegistered: Story = {
  args: {
    card: generateSidebarCardContent({
      id: "not-registered",
      contentMd: "Not Registered",
      header: "Not Registered",
    }),
    ctaOnClick: () => {},
  },
};

export const GoToProfile: Story = {
  args: {
    card: generateSidebarCardContent({
      id: "go-to-profile",
      contentMd: "Card Body Text",
      header: "Go to Profile",
      preBodySpanButtonText: "Go to Your Profile",
    }),
    ctaOnClick: () => {},
  },
};
