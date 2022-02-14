import { Alert } from "@/components/njwds-extended/Alert";
import { SitewideErrorDefaults } from "@/display-defaults/SitewideErrorDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { UserDataError } from "@/lib/types/types";
import React, { ReactElement } from "react";

const UserDataErrorLookup: Record<UserDataError, string> = {
  NO_DATA: SitewideErrorDefaults.errorTextNoData,
  CACHED_ONLY: SitewideErrorDefaults.errorTextCachedOnly,
  UPDATE_FAILED: SitewideErrorDefaults.errorTextUpdateFailed,
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
