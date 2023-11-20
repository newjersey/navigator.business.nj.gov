import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { SidebarCardContent } from "@/lib/types/types";
import { generateSidebarCardContent } from "@/test/factories";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Molecules/Cards/SideBarCards",
  component: SidebarCardGeneric,
  decorators: [(Story) => <div className="width-mobile-lg">{Story()}</div>],

  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=3266-13862&mode=design&t=3BT1qFE9mGxbn6Ko-0",
    },
  },
} as ComponentMeta<typeof SidebarCardGeneric>;

type Props = {
  card: SidebarCardContent;
  bodyText: string;
  headerText: string | undefined;
  ctaOnClick?: () => void;
  layout?: "column";
};

const Template: ComponentStory<typeof SidebarCardGeneric> = ({ ...args }) => <SidebarCardGeneric {...args} />;

export const FormationNudge = Template.bind({});
let sideBarCard = generateSidebarCardContent({ id: "formation-nudge" });

FormationNudge.args = {
  card: sideBarCard,
  bodyText: "Formation Card Body Text",
  headerText: "Formation Card",
  ctaOnClick: () => {},
};

export const FundingNudge = Template.bind({});
sideBarCard = generateSidebarCardContent({ id: "funding-nudge" });

FundingNudge.args = {
  card: sideBarCard,
  bodyText: "Funding Card Body Text",
  headerText: "Funding Card",
  ctaOnClick: () => {},
};

export const RegisteredForTaxes = Template.bind({});
sideBarCard = generateSidebarCardContent({ id: "registered-for-taxes-nudge" });

RegisteredForTaxes.args = {
  card: sideBarCard,
  bodyText: "Registered For Taxes Card Body Text",
  headerText: "Registered For Taxes",
  ctaOnClick: () => {},
};

export const NotRegistered = Template.bind({});
sideBarCard = generateSidebarCardContent({ id: "not-registered" });

NotRegistered.args = {
  card: sideBarCard,
  bodyText: "Not Registered",
  headerText: "Not Registered",
  ctaOnClick: () => {},
};

export const GoToProfile = Template.bind({});
sideBarCard = generateSidebarCardContent({ id: "go-to-profile" });

GoToProfile.args = {
  card: sideBarCard,
  bodyText: "Card Body Text",
  headerText: "Go to Profile",
  preBodySpanButtonText: "Go to Your Profile",
  ctaOnClick: () => {},
};
