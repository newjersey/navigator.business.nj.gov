import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { FIELDS_FOR_PROFILE, isFieldAnswered } from "@businessnjgovnavigator/shared";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

export const ProfileOpportunitiesAlert = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const router = useRouter();

  const unansweredOpportunityFields = FIELDS_FOR_PROFILE.filter((field) => {
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

  if (unansweredOpportunityFields.length === 0) {
    return <></>;
  }

  return (
    <Alert variant="info" dataTestid="opp-alert">
      <Content>{Config.profileDefaults.profileCompletionAlert}</Content>
      <ul>
        {unansweredOpportunityFields.map((field) => (
          <li key={field}>
            <UnStyledButton style="tertiary" underline onClick={() => router.replace(`#question-${field}`)}>
              {getLabel(field as ProfileContentField)}
            </UnStyledButton>
          </li>
        ))}
      </ul>
    </Alert>
  );
};
