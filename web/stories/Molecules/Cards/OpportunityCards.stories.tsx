import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { generateOpportunity } from "@/test/factories";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Molecules/Cards/OpportunityCards",
  component: OpportunityCard,
  decorators: [(Story) => <div className="width-mobile-lg">{Story()}</div>],

  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=3266-13862&mode=design&t=bfMQvK7jvUPHFcE9-0",
    },
  },
} as ComponentMeta<typeof OpportunityCard>;

const Template: ComponentStory<typeof OpportunityCard> = ({ ...args }) => <OpportunityCard {...args} />;

export const FundingCard = Template.bind({});

const fundingOpportunity = generateOpportunity({ name: "Test Name for Card" });
FundingCard.args = {
  opportunity: fundingOpportunity,
  urlPath: "funding",
  isLast: false,
};

export const CertificationCard = Template.bind({});
const certificationOpportunity = generateOpportunity({ name: "Test Name for Card" });
CertificationCard.args = {
  opportunity: certificationOpportunity,
  urlPath: "certification",
  isLast: false,
};
