import { ProfileTab } from "@/components/profile/ProfileTab";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileTabs } from "@/lib/types/types";
import { isStartingBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, useRef } from "react";

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

  const isSuccessfulFilingResponse =
    props.business?.formationData.getFilingResponse?.success;
  const shouldDisplayFormationDocuments =
    isStartingBusiness(props.business) &&
    LookupLegalStructureById(
      props.business?.profileData.legalStructureId
    ).elementsToDisplay.has("formationDocuments");
  const shouldShowDocuments =
    isSuccessfulFilingResponse || shouldDisplayFormationDocuments;

  const tabRefs = {
    [infoTab]: useRef<HTMLButtonElement>(null),
    [numbersTab]: useRef<HTMLButtonElement>(null),
    [documentsTab]: useRef<HTMLButtonElement>(null),
    [notesTab]: useRef<HTMLButtonElement>(null),
  };

  const availableTabs = [
    infoTab,
    numbersTab,
    ...(shouldShowDocuments ? [documentsTab] : []),
    notesTab,
  ];

  const handleKeyDown = (
    event: React.KeyboardEvent,
    currentTab: ProfileTabs
  ): void => {
    const currentIndex = availableTabs.indexOf(currentTab);
    let nextTabToFocus: ProfileTabs | undefined;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        if (currentIndex > 0) {
          nextTabToFocus = availableTabs[currentIndex - 1] as ProfileTabs;
        } else {
          nextTabToFocus = availableTabs[
            availableTabs.length - 1
          ] as ProfileTabs;
        }
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        if (currentIndex < availableTabs.length - 1) {
          nextTabToFocus = availableTabs[currentIndex + 1] as ProfileTabs;
        } else {
          nextTabToFocus = availableTabs[0] as ProfileTabs;
        }
        break;
      case "Enter":
        event.preventDefault();
        props.setProfileTab(currentTab);
        return;
    }

    if (nextTabToFocus) {
      tabRefs[nextTabToFocus]?.current?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-orientation="vertical"
      className="width-100 font-body-md desktop:padding-top-2 padding-top-2"
    >
      <ProfileTab
        {...props}
        tab={infoTab}
        tabIcon="info-outline"
        tabText={Config.profileDefaults.default.profileTabInfoTitle}
        onKeyDown={(e) => handleKeyDown(e, infoTab)}
        ref={tabRefs[infoTab]}
      />
      <ProfileTab
        {...props}
        tab={numbersTab}
        tabIcon="bar-chart"
        tabText={Config.profileDefaults.default.profileTabNumbersTitle}
        onKeyDown={(e) => handleKeyDown(e, numbersTab)}
        ref={tabRefs[numbersTab]}
      />
      {shouldShowDocuments && (
        <ProfileTab
          {...props}
          tab={documentsTab}
          tabIcon="folder-open"
          tabText={Config.profileDefaults.default.profileTabDocsTitle}
          onKeyDown={(e) => handleKeyDown(e, documentsTab)}
          ref={tabRefs[documentsTab]}
        />
      )}
      <ProfileTab
        {...props}
        tab={notesTab}
        tabIcon="edit"
        tabText={Config.profileDefaults.default.profileTabNoteTitle}
        onKeyDown={(e) => handleKeyDown(e, notesTab)}
        ref={tabRefs[notesTab]}
      />
    </div>
  );
};
