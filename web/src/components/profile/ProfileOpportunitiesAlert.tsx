import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { getFieldsForProfile, isFieldAnswered } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const ProfileOpportunitiesAlert = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const unansweredOpportunityFields = getFieldsForProfile(state.profileData.legalStructureId).filter(
    (field) => {
      return !isFieldAnswered(field, state.profileData);
    },
  );

  const getLabel = (field: ProfileContentField): string => {
    const contentFromConfig = getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: field,
    });
    return contentFromConfig.header;
  };

  if (unansweredOpportunityFields.length === 0) {
    return <></>;
  }

  return (
    <Alert variant="info" dataTestid="opp-alert">
      <Content>{Config.profileDefaults.default.profileCompletionAlert}</Content>
      <ul>
        {unansweredOpportunityFields.map((field) => (
          <li key={field} data-testid={`question-${field}-alert-text`}>
            <a href={`#question-${field}`}>{getLabel(field as ProfileContentField)}</a>
          </li>
        ))}
      </ul>
    </Alert>
  );
};
