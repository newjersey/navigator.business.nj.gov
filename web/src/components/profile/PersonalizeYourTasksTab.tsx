import { Content } from "@/components/Content";
import { IndustryBasedNonEssentialQuestionsSection } from "@/components/data-fields/non-essential-questions/IndustryBasedNonEssentialQuestionsSection";
import { LocationBasedNonEssentialQuestions } from "@/components/data-fields/non-essential-questions/LocationBasedNonEssentialQuestions";
import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { ProfileTabHeader } from "@/components/profile/ProfileTabHeader";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { hasNonEssentialQuestions } from "@/lib/utils/non-essential-questions-helpers";
import { Accordion, AccordionDetails, AccordionSummary, Avatar } from "@mui/material";
import { ReactElement, useContext } from "react";

export const PersonalizeYourTasksTab = (): ReactElement => {
  const { Config } = useConfig();
  const { state: profileDataState } = useContext(ProfileDataContext);
  const profileData = profileDataState.profileData;
  const AccordionHeader = (props: {
    icon: string;
    headerText: string;
    description: string;
    hideExpandIcon?: boolean;
  }): ReactElement => {
    return (
      <AccordionSummary
        expandIcon={
          props.hideExpandIcon ? null : (
            <div data-testid="ExpandMoreIcon">
              <Icon className={"usa-icon--size-5 margin-left-1"} iconName="expand_more" />
            </div>
          )
        }
      >
        <div className={"display-flex flex-column"}>
          <span className={"display-flex flew-row"}>
            <span className={"margin-right-2"}>
              <Avatar className="bg-secondary-lighter" style={{ height: 30, width: 30 }}>
                <Icon className="text-secondary-darker" iconName={props.icon}></Icon>
              </Avatar>
            </span>
            <Heading level={3}>{props.headerText}</Heading>
          </span>

          <Content className={"padding-left-6"}>{props.description}</Content>
        </div>
      </AccordionSummary>
    );
  };

  return (
    <div id="tabpanel-personalize" role="tabpanel" aria-labelledby="tab-personalize">
      <ProfileTabHeader tab="personalize" />
      <hr className="margin-y-4" />
      <Accordion>
        <AccordionHeader
          icon={"calendar_today"}
          headerText={Config.profileDefaults.default.annualReportDeadlineHeader}
          description={Config.profileDefaults.default.annualReportDeadlineSubText}
        />
        <AccordionDetails sx={{ marginLeft: 6 }}>ANNUAL REPORT DEADLINE DETAILS</AccordionDetails>
      </Accordion>
      <hr className="margin-y-4" />
      <Accordion>
        <AccordionHeader
          icon={"attach_money"}
          headerText={Config.profileDefaults.default.filterCertificationsAndFundingHeader}
          description={Config.profileDefaults.default.filterCertificationsAndFundingSubText}
        />
        <AccordionDetails sx={{ marginLeft: 6 }}>FILTER CERTIFICATIONS DETAILS</AccordionDetails>
      </Accordion>
      <hr className="margin-y-4" />
      <Accordion>
        <AccordionHeader
          icon={"location_on"}
          headerText={Config.profileDefaults.default.locationBasedRequirementsHeader}
          description={Config.profileDefaults.default.locationBasedRequirementsSubText}
        />
        <AccordionDetails sx={{ marginLeft: 6 }}>
          <LocationBasedNonEssentialQuestions />
        </AccordionDetails>
      </Accordion>
      <hr className="margin-y-4" />
      <Accordion data-testid="nonEssentialQuestionsAccordianSection">
        <AccordionHeader
          icon={"search"}
          headerText={Config.profileDefaults.fields.nonEssentialQuestions.default.sectionHeader}
          description={Config.profileDefaults.fields.nonEssentialQuestions.default.sectionSubText}
          hideExpandIcon={!hasNonEssentialQuestions(profileData)}
        />
        <AccordionDetails sx={{ marginLeft: 6 }}>
          <IndustryBasedNonEssentialQuestionsSection />
        </AccordionDetails>
      </Accordion>
      <hr className="margin-y-4" />
    </div>
  );
};
