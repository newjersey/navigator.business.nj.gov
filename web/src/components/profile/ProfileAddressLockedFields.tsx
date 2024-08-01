import { AddressContext } from "@/contexts/addressContext";
import { getMergedConfig } from "@/contexts/configContext";
import { ReactElement, useContext } from "react";

export const ProfileAddressLockedFields = (): ReactElement => {
  const { state } = useContext(AddressContext);

  const Config = getMergedConfig();
  return (
    <div className="margin-top-4 margin-bottom-4" data-testid={"locked-profileAddressFields"}>
      <div className="text-bold margin-bottom-05">
        {Config.profileDefaults.fields.businessAddress.default.header}
      </div>

      {state.addressData.addressLine1 &&
        state.addressData.addressMunicipality &&
        state.addressData.addressState &&
        state.addressData.addressZipCode && (
          <>
            <div data-testid={"locked-profileAddressLine1"}>{state.addressData.addressLine1}</div>
            {state.addressData.addressLine2 && (
              <div data-testid={"locked-profileAddressLine2"}>{state.addressData.addressLine2}</div>
            )}
            <div
              data-testid={"locked-profileAddressMuniStateZip"}
            >{`${state.addressData.addressMunicipality?.displayName}, ${state.addressData.addressState?.shortCode} ${state.addressData.addressZipCode}`}</div>
          </>
        )}
    </div>
  );
};
