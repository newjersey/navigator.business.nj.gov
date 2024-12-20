import { FieldEntryAlert } from "@/components/FieldEntryAlert";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { getFieldsForProfile, isFieldAnswered } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const ProfileOpportunitiesAlert = (): ReactElement<any> => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const unansweredOpportunityFields = getFieldsForProfile(state.profileData).filter((field) => {
    return !isFieldAnswered(field, state.profileData);
  });

  const getLabel = (field: ProfileContentField): string => {
    const contentFromConfig = getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: field,
    });
    return contentFromConfig.header;
  };

  const unansweredFields = unansweredOpportunityFields.map((field) => ({
    name: field,
    label: getLabel(field as ProfileContentField),
  }));

  return (
    <FieldEntryAlert
      alertMessage={Config.profileDefaults.default.profileCompletionAlert}
      alertProps={{
        dataTestid: "opp-alert",
        variant: "info",
      }}
      fields={unansweredFields}
    />
  );
};
