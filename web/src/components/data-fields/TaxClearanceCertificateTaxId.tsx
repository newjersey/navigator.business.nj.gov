import { ProfileDataFieldProps } from "@/components/data-fields/ProfileDataField";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ReactElement, useContext } from "react";

interface Props
  extends Omit<
    ProfileDataFieldProps,
    "fieldName" | "handleChange" | "onValidation" | "inputWidth"
  > {
  handleChangeOverride?: (value: string) => void;
  inputWidth?: "full" | "default" | "reduced";
}

export const TaxClearanceCertificateTaxId = (props: Props): ReactElement => {
  const fieldName = "taxId";

  const { business } = useUserData();
  const { state, setProfileData } = useContext(ProfileDataContext);

  return (
    <TaxId
      taxId={state.profileData[fieldName]}
      businessTaxId={business?.profileData.taxId}
      encryptedTaxId={state.profileData.encryptedTaxId}
      setDecryptedTaxId={(decryptedTaxId) =>
        setProfileData({ ...state.profileData, taxId: decryptedTaxId })
      }
      {...props}
    />
  );
};
