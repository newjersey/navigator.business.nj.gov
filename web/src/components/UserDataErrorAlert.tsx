import { Alert } from "@/components/njwds-extended/Alert";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { UserDataError } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

const UserDataErrorLookup: Record<UserDataError, string> = {
  NO_DATA: Config.sitewideErrorMessages.errorTextNoData,
  CACHED_ONLY: Config.sitewideErrorMessages.errorTextCachedOnly,
  UPDATE_FAILED: Config.sitewideErrorMessages.errorTextUpdateFailed,
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
