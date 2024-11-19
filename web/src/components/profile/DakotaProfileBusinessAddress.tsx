import { ProfileAddressLockedFields } from "@/components/profile/ProfileAddressLockedFields";
import { ProfileIntlAddress } from "@/components/profile/ProfileIntlAddress";
import { ProfileUsAddress } from "@/components/profile/ProfileUsAddress";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  selectedValue: string;
  handleDakotaRadioSelection: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export const DakotaProfileBusinessAddress = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();

  // console.log("selectedValue", props.selectedValue);

  const isAddressFieldsDisabled = business?.formationData.completedFilingPayment;

  return (
    <>
      {isAddressFieldsDisabled ? (
        <ProfileAddressLockedFields />
      ) : (
        <div>
          <div className="text-bold margin-top-3">
            {Config.profileDefaults.fields.businessAddress.default.header}
          </div>
          <FormControl fullWidth>
            <RadioGroup
              name="business-address"
              value={props.selectedValue}
              onChange={props.handleDakotaRadioSelection}
            >
              <FormControlLabel
                labelPlacement="end"
                style={{ alignItems: "center" }}
                data-testid="profile-us-address"
                value="US"
                control={<Radio color="primary" />}
                label={Config.profileDefaults.fields.businessAddress.default.usAddress}
              />
              <FormControlLabel
                labelPlacement="end"
                style={{ alignItems: "center" }}
                data-testid="profile-intl-address"
                value="INTL"
                control={<Radio color="primary" />}
                label={Config.profileDefaults.fields.businessAddress.default.intlAddress}
              />
            </RadioGroup>
          </FormControl>
          {/* {props.selectedValue === "US" ? <ProfileUsAddress /> : <ProfileIntlAddress />} */}
          {props.selectedValue === "US" && <ProfileUsAddress />}
          {props.selectedValue === "INTL" && <ProfileIntlAddress />}
        </div>
      )}
    </>
  );
};
