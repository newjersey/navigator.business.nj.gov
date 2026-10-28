import type { ReactElement } from "react";
import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";

type Props = {
  industryId?: string;
};

export const CannabisLocationAlert = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return props.industryId === "cannabis" ? (
    <Alert variant="warning">{Config.profileDefaults.default.cannabisLocationAlert}</Alert>
  ) : (
    <></>
  );
};
