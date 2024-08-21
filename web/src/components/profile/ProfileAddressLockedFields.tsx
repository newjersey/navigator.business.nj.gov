import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Icon } from "@/components/njwds/Icon";
import { AddressContext } from "@/contexts/addressContext";
import { getMergedConfig } from "@/contexts/configContext";
import { ReactElement, useContext } from "react";

export const ProfileAddressLockedFields = (): ReactElement => {
  const { state } = useContext(AddressContext);

  const Config = getMergedConfig();
  return (
    <div className="margin-top-4 margin-bottom-4" data-testid={"locked-profileAddressFields"}>
      <div className="flex flex-row fac margin-bottom-05">
        <div className="text-bold">{Config.profileDefaults.fields.businessAddress.default.header}</div>
        <div className="margin-left-1">
          <ArrowTooltip
            title={Config.profileDefaults.default.lockedFieldTooltipText}
            data-testid="locked-profileBusinessAddressTooltip"
          >
            <div className="fdr fac font-body-lg">
              <Icon>help_outline</Icon>
            </div>
          </ArrowTooltip>
        </div>
      </div>

      {state.addressData.addressLine1 &&
      state.addressData.addressMunicipality &&
      state.addressData.addressState &&
      state.addressData.addressZipCode ? (
        <>
          <div data-testid={"locked-profileAddressLine1"}>{state.addressData.addressLine1}</div>
          {state.addressData.addressLine2 && (
            <div data-testid={"locked-profileAddressLine2"}>{state.addressData.addressLine2}</div>
          )}
          <div
            data-testid={"locked-profileAddressMuniStateZip"}
          >{`${state.addressData.addressMunicipality?.displayName}, ${state.addressData.addressState?.shortCode} ${state.addressData.addressZipCode}`}</div>
        </>
      ) : (
        <>
          <div data-testid="locked-profileAddressNotProvided">
            {Config.profileDefaults.default.profileAddressNotProvided}
          </div>
        </>
      )}
    </div>
  );
};
