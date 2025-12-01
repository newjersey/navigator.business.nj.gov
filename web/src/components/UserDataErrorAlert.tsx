import { Alert } from "@/components/njwds-extended/Alert";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { UserDataError } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

const Config = getMergedConfig();
const UserDataErrorLookup: Record<UserDataError, string> = {
  NO_DATA: Config.siteWideErrorMessages.errorTextNoData,
  CACHED_ONLY: Config.siteWideErrorMessages.errorTextCachedOnly,
  UPDATE_FAILED: Config.siteWideErrorMessages.errorTextUpdateFailed,
};

export const UserDataErrorAlert = (): ReactElement => {
  const { error } = useUserData();

  return error ? (
    <Alert dataTestid={`error-alert-${error}`} variant="error">
      {UserDataErrorLookup[error]}
    </Alert>
  ) : (
    <></>
  );
};
