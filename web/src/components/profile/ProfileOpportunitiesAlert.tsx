import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { isFieldAnswered, OPPORTUNITY_FIELDS } from "@/lib/domain-logic/opportunityFields";
import { ProfileContentField } from "@/lib/types/types";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

export const ProfileOpportunitiesAlert = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const router = useRouter();

  const unansweredOpportunityFields: ProfileContentField[] = OPPORTUNITY_FIELDS.filter((field) => {
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
              {getLabel(field)}
            </UnStyledButton>
          </li>
        ))}
      </ul>
    </Alert>
  );
};
