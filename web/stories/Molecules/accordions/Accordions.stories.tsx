import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Molecules/Accordion",
  component: Accordion,
  decorators: [
    (Story) => (
      <div className="width-mobile height-mobile bg-base-lighter flex flex-align-center flex-justify-center">
        <div className="width-card-lg height-card-lg ">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2845%3A6061&t=jco1GPB7R1gpl8cH-1",
    },
  },
} as ComponentMeta<typeof Accordion>;
interface Obj {
  isSmallIcon?: boolean;
}
const renderAccordion = (obj: Obj) => (
  <Accordion
    elevation={0}
    onChange={() => {}}
    square={false}
    sx={{ "&:before": { display: "none" } }}
    className=""
  >
    <AccordionSummary
      aria-controls=""
      expandIcon={
        <Icon
          className={obj.isSmallIcon ? "usa-icon--size-3 text-base-darkest" : "usa-icon--size-5 margin-x-1"}
        >
          expand_more
        </Icon>
      }
      id=""
      data-testid=""
    >
      title
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

const SingleAccordionLargeIconTemplate: ComponentStory<typeof Accordion> = (args) => {
  return renderAccordion({ isSmallIcon: false });
};
export const AccordionLargeIcon = SingleAccordionLargeIconTemplate.bind({});

const SingleAccordionSmallIconTemplate: ComponentStory<typeof Accordion> = (args) => {
  return renderAccordion({ isSmallIcon: true });
};
export const AccordionSmallIcon = SingleAccordionSmallIconTemplate.bind({});

const MultipleAccordionSmallIconTemplate: ComponentStory<typeof Accordion> = (args) => {
  return (
    <>
      {renderAccordion({ isSmallIcon: true })}
      <div className="margin-top-2"></div>
      {renderAccordion({ isSmallIcon: true })}
    </>
  );
};
export const MultipleAccordionSmallIcon = MultipleAccordionSmallIconTemplate.bind({});
