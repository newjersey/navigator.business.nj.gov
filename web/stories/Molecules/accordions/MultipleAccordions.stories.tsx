import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => {
  return (
    <>
      <Accordion onChange={() => {}} square={false} className="">
        <AccordionSummary
          aria-controls=""
          expandIcon={<Icon className={"usa-icon--size-3 text-base-darkest"} iconName="expand_more" />}
        >
          <div>Accordion Summary Text</div>
        </AccordionSummary>
        <AccordionDetails>
          <Content>
            {
              "Accordion details go here, additional styling like padding or headers can be added to both the Accordion Summary and Accordion Details sections"
            }
          </Content>
        </AccordionDetails>
      </Accordion>
      <hr />
      <Accordion onChange={() => {}} square={false} className="">
        <AccordionSummary
          aria-controls=""
          expandIcon={<Icon className={"usa-icon--size-3 text-base-darkest"} iconName="expand_more" />}
        >
          <div>Accordion Summary Text</div>
        </AccordionSummary>
        <AccordionDetails>
          <Content>
            {
              "Accordion details go here, additional styling like padding or headers can be added to both the Accordion Summary and Accordion Details sections"
            }
          </Content>
        </AccordionDetails>
      </Accordion>
      <hr />
      <Accordion onChange={() => {}} square={false} className="">
        <AccordionSummary
          aria-controls=""
          expandIcon={<Icon className={"usa-icon--size-3 text-base-darkest"} iconName="expand_more" />}
        >
          <div>Accordion Summary Text</div>
        </AccordionSummary>
        <AccordionDetails>
          <Content>
            {
              "Accordion details go here, additional styling like padding or headers can be added to both the Accordion Summary and Accordion Details sections"
            }
          </Content>
        </AccordionDetails>
      </Accordion>
      <hr />
    </>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/Accordion",
  component: Template,
  decorators: [(Story) => <div className="maxw-mobile-lg">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=3034%3A10889&t=LSt0MDLGYZhV7UDI-1",
    },
  },
};
export default meta;
type Story = StoryObj<typeof Template>;

export const MultipleAccordions: Story = {};
