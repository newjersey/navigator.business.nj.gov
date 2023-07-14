import { Content } from "@/components/Content";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileTabs } from "@/lib/types/types";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { BusinessPersona, ForeignBusinessType } from "@businessnjgovnavigator/shared/profileData";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  business: Business | undefined;
  businessPersona: BusinessPersona;
  foreignBusinessType: ForeignBusinessType;
  activeTab: ProfileTabs;
  setProfileTab: (profileTab: ProfileTabs) => void;
}

export const ProfileTabNav = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const shouldShowInfo = (): boolean => {
    return true;
  };

  const shouldShowNumbers = (): boolean => {
    return true;
  };

  const shouldShowNotes = (): boolean => {
    return true;
  };

  const shouldShowDocuments = (): boolean => {
    if (props.business?.formationData.getFilingResponse?.success) {
      return true;
    }
    if (props.businessPersona === "STARTING") {
      return LookupLegalStructureById(props.business?.profileData.legalStructureId).elementsToDisplay.has(
        "formationDocuments"
      );
    }
    return false;
  };

  return (
    <div className="width-100 font-body-md">
      <div className="bg-base-lightest padding-y-2 padding-x-3 border-2px border-base-lighter">
        <Content>{Config.profileDefaults.pageTitle}</Content>
      </div>

      {shouldShowInfo() && <ProfileTab {...props} tab="info" />}
      {shouldShowNumbers() && <ProfileTab {...props} tab="numbers" />}
      {shouldShowDocuments() && <ProfileTab {...props} tab="documents" />}
      {shouldShowNotes() && <ProfileTab {...props} tab="notes" />}
    </div>
  );
};
