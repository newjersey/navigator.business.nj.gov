import { Content } from "@/components/Content";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { filterCertifications } from "@/lib/domain-logic/filterCertifications";
import { filterFundings } from "@/lib/domain-logic/filterFundings";
import { sortCertifications } from "@/lib/domain-logic/sortCertifications";
import { sortFundings } from "@/lib/domain-logic/sortFundings";
import { Certification, DashboardDisplayContent, Funding } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import React, { ReactElement, useState } from "react";

interface Props {
  certifications: Certification[];
  fundings: Funding[];
  displayContent: DashboardDisplayContent;
}

export const OpportunitiesList = (props: Props): ReactElement => {
  const [hiddenAccordionIsOpen, setHiddenAccordionIsOpen] = useState<boolean>(false);
  const { userData } = useUserData();

  const filteredSortedFundings = userData ? sortFundings(filterFundings(props.fundings, userData)) : [];
  const filteredSortedCertifications = userData
    ? sortCertifications(filterCertifications(props.certifications, userData))
    : [];
  const nonHiddenSortedFundings = filteredSortedFundings.filter(
    (it) => !userData?.preferences.hiddenFundingIds.includes(it.id)
  );
  const nonHiddenSortedCertifications = filteredSortedCertifications.filter(
    (it) => !userData?.preferences.hiddenCertificationIds.includes(it.id)
  );

  const hiddenSortedCertifications = sortCertifications(
    (userData?.preferences.hiddenCertificationIds || [])
      .map((id) => props.certifications.find((it) => it.id === id))
      .filter((it) => it !== undefined) as Certification[]
  );
  const hiddenSortedFundings = sortFundings(
    (userData?.preferences.hiddenFundingIds || [])
      .map((id) => props.fundings.find((it) => it.id === id))
      .filter((it) => it !== undefined) as Funding[]
  );

  const hiddenOpportunitiesCount = (): number => {
    if (!userData) return 0;
    return userData.preferences.hiddenFundingIds.length + userData.preferences.hiddenCertificationIds.length;
  };

  return (
    <>
      <header className="flex flex-justify flex-align-center">
        <h2>{Config.dashboardDefaults.opportunitiesHeader}</h2>
        <div className="text-base-dark font-sans-xs margin-bottom-2 padding-right-105">
          {templateEval(Config.dashboardDefaults.opportunitiesCount, {
            count: String(nonHiddenSortedFundings.length + nonHiddenSortedCertifications.length),
          })}
        </div>
      </header>
      <div className="dashboard-opportunities-list padding-right-105" data-testid="visible-opportunities">
        {nonHiddenSortedCertifications.map((cert) => (
          <OpportunityCard key={cert.id} opportunity={cert} urlPath="certification" />
        ))}
        {nonHiddenSortedFundings.map((funding) => (
          <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />
        ))}
        {nonHiddenSortedFundings.length + nonHiddenSortedCertifications.length === 0 && (
          <div className="fdc fac margin-y-3">
            <h3 className="text-normal">{Config.dashboardDefaults.emptyOpportunitiesHeader}</h3>
            <img src={`/img/signpost.svg`} className="" alt="" />
            <p className="text-center">{Config.dashboardDefaults.emptyOpportunitiesText}</p>
          </div>
        )}
      </div>
      <hr className="margin-bottom-3 margin-top-0 margin-right-105" aria-hidden={true} />

      <div className="margin-y-205 weight-unset-override">
        <Content>{props.displayContent.opportunityTextMd}</Content>
      </div>

      <Accordion
        elevation={0}
        expanded={hiddenAccordionIsOpen}
        onChange={() => setHiddenAccordionIsOpen(!hiddenAccordionIsOpen)}
      >
        <AccordionSummary
          expandIcon={<Icon className="usa-icon--size-5 margin-x-1 text-primary">expand_more</Icon>}
          aria-controls="hidden-opportunity-content"
          id="hidden-opportunity-header"
          data-testid="hidden-opportunity-header"
        >
          <div className="margin-y-2">
            <h3 className="flex flex-align-center margin-0-override text-normal">
              <div className="inline">
                {templateEval(Config.dashboardDefaults.hiddenOpportunitiesHeader, {
                  count: String(hiddenOpportunitiesCount()),
                })}
              </div>
            </h3>
          </div>
        </AccordionSummary>
        <AccordionDetails data-testid="hidden-opportunities">
          {hiddenSortedCertifications.map((cert) => (
            <OpportunityCard key={cert.id} opportunity={cert} urlPath="certification" />
          ))}
          {hiddenSortedFundings.map((funding) => (
            <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />
          ))}
        </AccordionDetails>
      </Accordion>
    </>
  );
};
