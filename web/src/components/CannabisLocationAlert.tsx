import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ReactElement } from "react";

export const CannabisLocationAlert = (): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();

  return business?.profileData.industryId === "cannabis" ? (
    <Alert variant="warning">
      <Content>{Config.profileDefaults.default.cannabisLocationAlert}</Content>
    </Alert>
  ) : (
    <></>
  );
};
