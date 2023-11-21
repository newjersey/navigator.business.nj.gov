import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { generateOpportunity } from "@/test/factories";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof OpportunityCard> = {
  title: "Molecules/Cards/OpportunityCards",
  component: OpportunityCard,
  decorators: [(Story) => <div className="width-mobile-lg">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=3266-13862&mode=design&t=bfMQvK7jvUPHFcE9-0",
    },
  },
};

export default meta;
type Story = StoryObj<typeof OpportunityCard>;

export const FundingCard: Story = {
  args: {
    opportunity: generateOpportunity({ name: "Test Name for Card" }),
    urlPath: "funding",
    isLast: false,
  },
};

export const CertificationCard: Story = {
  args: {
    opportunity: generateOpportunity({ name: "Test Name for Card" }),
    urlPath: "certification",
    isLast: false,
  },
};
