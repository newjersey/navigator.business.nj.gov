import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Molecules/Accordion",
  component: Accordion,
  decorators: [(Story) => <div className="maxw-mobile-lg">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=3034%3A10889&t=LSt0MDLGYZhV7UDI-1",
    },
  },
} as ComponentMeta<typeof Accordion>;

const LargeAccordionTemplate: ComponentStory<typeof Accordion> = () => {
  return (
    <Accordion onChange={() => {}}>
      <AccordionSummary
        aria-controls=""
        expandIcon={<Icon className={"usa-icon--size-5 margin-left-1"}>expand_more</Icon>}
      >
        <div className="flex flex-align-center">
          <img src="/img/section-complete.svg" className="margin-right-1" alt="" />
          <div className="h3-styling margin-0-override">Accordion Summary Text</div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Content>
          {
            "Accordion details go here, additional styling like padding or headers can be added to both the Accordion Summary and Accordion Details sections"
          }
        </Content>
      </AccordionDetails>
    </Accordion>
  );
};
export const LargeAccordion = LargeAccordionTemplate.bind({});

const SmallAccordionTemplate: ComponentStory<typeof Accordion> = () => {
  return (
    <Accordion onChange={() => {}}>
      <AccordionSummary
        aria-controls=""
        expandIcon={<Icon className={"usa-icon--size-3 text-base-darkest"}>expand_more</Icon>}
      >
        <div className="flex flex-align-center">
          <img src="/img/section-complete.svg" className="margin-right-105 height-205" alt="" />
          <div>Accordion Summary Text</div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Content>
          {
            "Accordion details go here, additional styling like padding or headers can be added to both the Accordion Summary and Accordion Details sections"
          }
        </Content>
      </AccordionDetails>
    </Accordion>
  );
};
export const SmallAccordion = SmallAccordionTemplate.bind({});

const MultipleAccordionsTemplate: ComponentStory<typeof Accordion> = () => {
  return (
    <>
      <Accordion onChange={() => {}} square={false} className="">
        <AccordionSummary
          aria-controls=""
          expandIcon={<Icon className={"usa-icon--size-3 text-base-darkest"}>expand_more</Icon>}
        >
          <div className="flex flex-align-center">
            <img src="/img/section-complete.svg" className="margin-right-105 height-205" alt="" />
            <div>Accordion Summary Text</div>
          </div>
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
          expandIcon={<Icon className={"usa-icon--size-3 text-base-darkest"}>expand_more</Icon>}
        >
          <div className="flex flex-align-center">
            <img src="/img/section-complete.svg" className="margin-right-105 height-205" alt="" />
            <div>Accordion Summary Text</div>
          </div>
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
          expandIcon={<Icon className={"usa-icon--size-3 text-base-darkest"}>expand_more</Icon>}
        >
          <div className="flex flex-align-center">
            <img src="/img/section-complete.svg" className="margin-right-105 height-205" alt="" />
            <div>Accordion Summary Text</div>
          </div>
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
export const MultipleAccordions = MultipleAccordionsTemplate.bind({});
