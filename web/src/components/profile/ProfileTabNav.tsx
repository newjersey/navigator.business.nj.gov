import { Heading } from "@/components/njwds-extended/Heading";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileTabs } from "@/lib/types/types";
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
    props.businessPersona === "STARTING" &&
    LookupLegalStructureById(props.business?.profileData.legalStructureId).elementsToDisplay.has(
      "formationDocuments"
    );
  const shouldShowDocuments = isSuccessfulFilingResponse || shouldDisplayFormationDocuments;

  return (
    <div className="width-100 font-body-md">
      <div className="bg-base-lightest padding-y-2 padding-x-3 border-2px border-base-lighter">
        <Heading level={3} className="margin-0-override">
          {Config.profileDefaults.default.pageTitle}
        </Heading>
      </div>
      <ProfileTab {...props} tab={infoTab}>
        {Config.profileDefaults.default.profileTabInfoTitle}
      </ProfileTab>
      <ProfileTab {...props} tab={numbersTab}>
        {Config.profileDefaults.default.profileTabNumbersTitle}
      </ProfileTab>
      {shouldShowDocuments && (
        <ProfileTab {...props} tab={documentsTab}>
          {Config.profileDefaults.default.profileTabDocsTitle}
        </ProfileTab>
      )}
      <ProfileTab {...props} tab={notesTab}>
        {Config.profileDefaults.default.profileTabNoteTitle}
      </ProfileTab>
    </div>
  );
};
