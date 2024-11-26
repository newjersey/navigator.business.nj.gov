import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { SectionAccordionContext } from "@/contexts/sectionAccordionContext";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, ReactNode, useState } from "react";

interface Props {
  title: string;
  children: ReactNode;
  mini?: boolean;
  isDividerDisabled?: boolean;
}

export const CheckWasteResultsAccordion = (props: Props): ReactElement => {
  const dropdownIconClasses = props.mini
    ? "usa-icon--size-5 text-base-light"
    : "usa-icon--size-5 margin-left-1";
  const headerClasses = props.mini ? "" : "margin-top-3 tablet:margin-left-3";
  const sectionName = props.title.toLowerCase();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div data-testid={`section-${sectionName}`}>
      <SectionAccordionContext.Provider value={{ isOpen }}>
        <Accordion expanded={isOpen} onChange={() => setIsOpen(!isOpen)}>
          <AccordionSummary
            expandIcon={<Icon className={dropdownIconClasses} iconName={"expand_more"} />}
            aria-controls={`${sectionName}-content`}
            id={`${sectionName}-header`}
            data-testid={`${sectionName}-header`}
          >
            <div>
              <Heading level={3} className={`flex flex-align-center margin-0-override ${headerClasses}`}>
                <div className="inline">{props.title}</div>
              </Heading>
            </div>
          </AccordionSummary>
          <AccordionDetails>{props.children}</AccordionDetails>
        </Accordion>
      </SectionAccordionContext.Provider>
      {!props.isDividerDisabled && <hr className="margin-y-05" />}
    </div>
  );
};
