import { ProfileTab } from "@/components/profile/ProfileTab";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileTabs } from "@/lib/types/types";
import { isStartingBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

const infoTab = "info";
const numbersTab = "numbers";
const documentsTab = "documents";
const notesTab = "notes";

interface Props {
  business: Business | undefined;
  businessPersona: BusinessPersona;
  activeTab: ProfileTabs;
  setProfileTab: (profileTab: ProfileTabs) => void;
}

export const ProfileTabNav = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const isSuccessfulFilingResponse = props.business?.formationData.getFilingResponse?.success;
  const shouldDisplayFormationDocuments =
    isStartingBusiness(props.business) &&
    LookupLegalStructureById(props.business?.profileData.legalStructureId).elementsToDisplay.has(
      "formationDocuments"
    );
  const shouldShowDocuments = isSuccessfulFilingResponse || shouldDisplayFormationDocuments;

  return (
    <div className="width-100 font-body-md desktop:padding-top-2 padding-top-2">
      <ProfileTab
        {...props}
        tab={infoTab}
        tabIcon="info-outline"
        tabText={Config.profileDefaults.default.profileTabInfoTitle}
      />
      <ProfileTab
        {...props}
        tab={numbersTab}
        tabIcon="bar-chart"
        tabText={Config.profileDefaults.default.profileTabNumbersTitle}
      />
      {shouldShowDocuments && (
        <ProfileTab
          {...props}
          tab={documentsTab}
          tabIcon="folder-open"
          tabText={Config.profileDefaults.default.profileTabDocsTitle}
        />
      )}
      <ProfileTab
        {...props}
        tab={notesTab}
        tabIcon="edit"
        tabText={Config.profileDefaults.default.profileTabNoteTitle}
      />
    </div>
  );
};
