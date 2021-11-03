import React, { ReactElement, useEffect } from "react";
import { useUserData } from "@/lib/data-hooks/useUserData";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { FilingReference, OperateDisplayContent } from "@/lib/types/types";
import { Content } from "../Content";
import { FilingsCalendar } from "@/components/roadmap/FilingsCalendar";
import { SectionAccordion } from "@/components/roadmap/SectionAccordion";
import { OperateEntityIdForm } from "@/components/roadmap/OperateEntityIdForm";

dayjs.extend(advancedFormat);

interface Props {
  displayContent: OperateDisplayContent;
  filingsReferences: Record<string, FilingReference>;
}

export const OperateSection = (props: Props): ReactElement => {
  const [showEntityIdForm, setShowEntityIdForm] = React.useState<boolean>(true);

  const { userData } = useUserData();

  useEffect(
    function showFilingsWhenTheyExist() {
      if (
        userData &&
        userData.profileData.entityId &&
        userData.taxFilingData.entityIdStatus === "EXISTS_AND_REGISTERED"
      ) {
        setShowEntityIdForm(false);
      }
    },
    [setShowEntityIdForm, userData, userData?.taxFilingData.entityIdStatus, userData?.profileData.entityId]
  );

  const renderEntityIdForm = (): ReactElement => (
    <div className="padding-x-3 padding-top-3 padding-bottom-105 border-base-lighter border-1px radius-md">
      <Content>{props.displayContent.entityIdMd}</Content>
      <OperateEntityIdForm displayContent={props.displayContent} />
    </div>
  );

  const renderFilings = (): ReactElement => {
    return (
      <div className="tablet:margin-x-3">
        <Content key="annualFilingMd">{props.displayContent.filingCalendarMd}</Content>
        <FilingsCalendar
          taxFilings={userData?.taxFilingData.filings || []}
          filingsReferences={props.filingsReferences}
        />
      </div>
    );
  };

  return (
    <SectionAccordion sectionType="OPERATE">
      <div className="margin-y-3">{showEntityIdForm ? renderEntityIdForm() : renderFilings()}</div>
    </SectionAccordion>
  );
};
