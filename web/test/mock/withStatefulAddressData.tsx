import { AddressContext } from "@/contexts/addressContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { Address, Municipality } from "@businessnjgovnavigator/shared/";
import { ReactElement, ReactNode, useState } from "react";

export const WithStatefulAddressData = ({
  children,
  initialData,
  municipalities,
}: {
  children: ReactNode;
  initialData: Address;
  municipalities: Municipality[];
}): ReactElement => {
  const [addressData, setAddressData] = useState<Address>(initialData);
  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());

  return (
    <ProfileFormContext.Provider value={formContextState}>
      <MunicipalitiesContext.Provider value={{ municipalities: municipalities }}>
        <AddressContext.Provider
          value={{
            state: {
              addressData: addressData,
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
