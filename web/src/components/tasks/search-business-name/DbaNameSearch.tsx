import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { AvailableProps } from "@/components/tasks/search-business-name/AvailableProps";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { NameAvailability } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

export const DbaNameSearch = (): ReactElement => {
  const { Config } = useConfig();
  const { userData, update } = useUserData();

  const onSubmit = async (submittedName: string, nameAvailability: NameAvailability): Promise<void> => {
    if (!nameAvailability || !userData) return;
    if (nameAvailability.status === "AVAILABLE") {
      await update({
        ...userData,
        profileData: {
          ...userData.profileData,
          nexusDbaName: submittedName,
        },
      });
    }
  };

  return (
    <>
      <Content>{`${Config.nexusNameSearch.dbaNameHeader}\n\n${Config.nexusNameSearch.dbaNameDescription}`}</Content>
      <SearchBusinessNameForm
        unavailable={DbaUnavailable}
        available={DbaAvailable}
        isDba={true}
        config={{
          searchButtonText: Config.nexusNameSearch.dbaNameSearchSubmitButton,
          searchButtonTestId: "search-dba-availability",
          inputPlaceholderText: Config.nexusNameSearch.dbaNameSearchPlaceholder,
          inputLabel: Config.nexusNameSearch.dbaNameSearchLabel,
        }}
        onSubmit={onSubmit}
      />
    </>
  );
};

const DbaUnavailable = (props: UnavailableProps): ReactElement => {
  const { Config } = useConfig();
  return (
    <div data-testid="unavailable-text margin-bottom-2">
      <Alert variant="error">
        <Content>
          {templateEval(Config.nexusNameSearch.dbaUnavailableText, { name: props.submittedName })}
        </Content>
        <ul className="font-body-2xs">
          {props.nameAvailability &&
            props.nameAvailability.similarNames.map((otherName) => (
              <li className="text-uppercase text-bold margin-top-0" key={otherName}>
                {otherName}
              </li>
            ))}
        </ul>
      </Alert>
    </div>
  );
};

const DbaAvailable = (props: AvailableProps): ReactElement => {
  const { Config } = useConfig();
  return (
    <div data-testid="available-text margin-bottom-2">
      <Alert variant="success">
        <Content>
          {templateEval(Config.nexusNameSearch.dbaAvailableText, { name: props.submittedName })}
        </Content>
      </Alert>
    </div>
  );
};
