import { AddressContext } from "@/contexts/addressContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { FormationAddress, Municipality } from "@businessnjgovnavigator/shared/";
import { ReactElement, ReactNode, useState } from "react";

export const WithStatefulAddressData = ({
  children,
  initialData,
  municipalities,
}: {
  children: ReactNode;
  initialData: FormationAddress;
  municipalities: Municipality[];
}): ReactElement => {
  const [addressData, setAddressData] = useState<FormationAddress>(initialData);
  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());

  return (
    <ProfileFormContext.Provider value={formContextState}>
      <MunicipalitiesContext.Provider value={{ municipalities: municipalities }}>
        <AddressContext.Provider
          value={{
            state: {
              formationAddressData: addressData,
            },
            setAddressData: setAddressData,
          }}
        >
          {children}
        </AddressContext.Provider>
      </MunicipalitiesContext.Provider>
    </ProfileFormContext.Provider>
  );
};
