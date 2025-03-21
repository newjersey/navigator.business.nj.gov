import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { SectionAccordionContext } from "@/contexts/sectionAccordionContext";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, ReactNode, useState } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export const ResultsSectionAccordion = (props: Props): ReactElement => {
  const sectionName = props.title.toLowerCase();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div data-testid={`section-${sectionName}`}>
      <SectionAccordionContext.Provider value={{ isOpen }}>
        <Accordion expanded={isOpen} onChange={() => setIsOpen(!isOpen)}>
          <AccordionSummary
            expandIcon={<Icon className={"usa-icon--size-5 margin-left-1"} iconName={"expand_more"} />}
            aria-controls={`${sectionName}-content`}
            id={`${sectionName}-header`}
            data-testid={`${sectionName}-header`}
          >
            <div>
              <Heading
                level={3}
                className={`flex flex-align-center margin-0-override margin-top-3 tablet:margin-left-3`}
              >
                <div className="inline">{props.title}</div>
              </Heading>
            </div>
          </AccordionSummary>
          <AccordionDetails>{props.children}</AccordionDetails>
        </Accordion>
      </SectionAccordionContext.Provider>
      <hr className="margin-y-05" />
    </div>
  );
};
