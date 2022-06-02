import { Content } from "@/components/Content";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileTabs } from "@/lib/types/types";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { Box } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  userData: UserData | undefined;
  businessPersona: BusinessPersona;
  activeTab: ProfileTabs;
  setProfileTab: (profileTab: ProfileTabs) => void;
}

export const ProfileTabNav = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const border = "2px #e6e6e6";

  const shouldShowInfo = () => {
    return props.businessPersona !== "FOREIGN";
  };

  const shouldShowNumbers = () => {
    return true;
  };

  const shouldShowNotes = () => {
    return true;
  };

  const shouldShowDocuments = () => {
    if (props.userData?.formationData.getFilingResponse?.success) return true;
    if (props.businessPersona == "STARTING") {
      return LookupLegalStructureById(props.userData?.profileData.legalStructureId).requiresPublicFiling;
    }
    return false;
  };

  return (
    <Box sx={{ fontSize: 18, fontWeight: 500 }}>
      <Box className="bg-base-lightest padding-y-2 padding-x-3" sx={{ border, borderStyle: "solid" }}>
        <Content>{Config.profileDefaults.pageTitle}</Content>
      </Box>

      {shouldShowInfo() && <ProfileTab {...props} tab="info" />}
      {shouldShowNumbers() && <ProfileTab {...props} tab="numbers" />}
      {shouldShowDocuments() && <ProfileTab {...props} tab="documents" />}
      {shouldShowNotes() && <ProfileTab {...props} tab="notes" />}
    </Box>
  );
};
