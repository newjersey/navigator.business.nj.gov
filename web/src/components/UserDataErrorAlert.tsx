import { Alert } from "@/components/njwds-extended/Alert";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { UserDataError } from "@/lib/types/types";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";

const UserDataErrorLookup: Record<UserDataError, string> = {
  NO_DATA: Defaults.sitewideErrorMessages.errorTextNoData,
  CACHED_ONLY: Defaults.sitewideErrorMessages.errorTextCachedOnly,
  UPDATE_FAILED: Defaults.sitewideErrorMessages.errorTextUpdateFailed,
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
