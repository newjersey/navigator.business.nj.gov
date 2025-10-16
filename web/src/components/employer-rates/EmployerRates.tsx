import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";
import { Heading } from "../njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Content } from "@/components/Content";
import { EmployerRatesQuestions } from "./EmployerRatesQuestions";
import { ProfileDataContext } from "@/contexts/profileDataContext";

interface Props {
  CMS_ONLY_enable_preview?: boolean;
}

export const EmployerRates = (props: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const operatingPhase = LookupOperatingPhaseById(state.profileData.operatingPhase);

  if (!operatingPhase.displayEmployerRatesInProfile && !props.CMS_ONLY_enable_preview) {
    return <></>;
  }

  return (
    <>
      <div className="margin-top-5 margin-bottom-10" data-testid={"employerAccess"}>
        <Heading level={3}>{Config.employerRates.sectionHeaderText}</Heading>
        <Content>{Config.employerRates.belowSectionHeaderText}</Content>

        <EmployerRatesQuestions CMS_ONLY_enable_preview={props.CMS_ONLY_enable_preview} />
      </div>
    </>
  );
};
