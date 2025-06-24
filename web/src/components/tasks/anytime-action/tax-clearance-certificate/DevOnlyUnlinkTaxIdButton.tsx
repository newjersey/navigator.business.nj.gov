import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  TaxClearanceCertificateResponseErrorType,
  UnlinkTaxIdResponse,
} from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

interface Props {
  setResponseErrorType?: (errorType: TaxClearanceCertificateResponseErrorType | undefined) => void;
}

export const DevOnlyUnlinkTaxIdButton = (props: Props): ReactElement => {
  const isUnlinkButtonEnabled = process.env.STAGE !== "prod";
  const { userData, refresh } = useUserData();

  const unlinkTaxId = async (): Promise<void> => {
    if (!userData) return;
    const res: UnlinkTaxIdResponse = await api.unlinkTaxId(userData);

    if (res.success) {
      refresh();
      props.setResponseErrorType !== undefined && props.setResponseErrorType(undefined);
    }
  };

  return (
    <>
      {isUnlinkButtonEnabled ? (
        <div className="margin-y-2">
          <PrimaryButton isColor="accent-cooler" onClick={unlinkTaxId}>
            Unlink Tax ID
          </PrimaryButton>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
