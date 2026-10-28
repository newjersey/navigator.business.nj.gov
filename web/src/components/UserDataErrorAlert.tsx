import type { UserDataError } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";

export const UserDataErrorAlert = (): ReactElement => {
  const { error } = useUserData();
  const { Config } = useConfig();
  const userDataErrorLookup: Record<UserDataError, string> = {
    NO_DATA: Config.siteWideErrorMessages.errorTextNoData,
    CACHED_ONLY: Config.siteWideErrorMessages.errorTextCachedOnly,
    UPDATE_FAILED: Config.siteWideErrorMessages.errorTextUpdateFailed,
  };

  return error ? (
    <Alert dataTestid={`error-alert-${error}`} variant="error">
      {userDataErrorLookup[error]}
    </Alert>
  ) : (
    <></>
  );
};
