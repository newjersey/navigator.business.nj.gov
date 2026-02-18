import { Alert } from "@/components/njwds-extended/Alert";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { UserDataError } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

const getUserDataErrorLookup = (): Record<UserDataError, string> => {
  const Config = getMergedConfig();
  return {
    NO_DATA: Config.siteWideErrorMessages.errorTextNoData,
    CACHED_ONLY: Config.siteWideErrorMessages.errorTextCachedOnly,
    UPDATE_FAILED: Config.siteWideErrorMessages.errorTextUpdateFailed,
  };
};

export const UserDataErrorAlert = (): ReactElement => {
  const { error } = useUserData();
  const UserDataErrorLookup = getUserDataErrorLookup();

  return error ? (
    <Alert dataTestid={`error-alert-${error}`} variant="error">
      {UserDataErrorLookup[error]}
    </Alert>
  ) : (
    <></>
  );
};
