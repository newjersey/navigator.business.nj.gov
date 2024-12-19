import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

type Props = {
  industryId?: string;
};

export const CannabisLocationAlert = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  return props.industryId === "cannabis" ? (
    <Alert variant="warning">{Config.profileDefaults.default.cannabisLocationAlert}</Alert>
  ) : (
    <></>
  );
};
