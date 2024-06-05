import { AddressContext } from "@/contexts/addressContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { Address } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, ReactNode, useEffect, useState } from "react";

const updateSpy = jest.fn();

export const WithStatefulAddressData = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: Address;
}): ReactElement => {
  const [addressData, setAddressData] = useState<Address>(initialData);
  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    updateSpy(addressData);
  }, [addressData]);

  const municipalities = loadAllMunicipalities();

  return (
    <ProfileFormContext.Provider value={formContextState}>
      <MunicipalitiesContext.Provider value={{ municipalities: municipalities }}>
        <AddressContext.Provider
          value={{
            state: {
              addressData: addressData,
              interactedFields: [],
              formContextState: formContextState,
            },
            setAddressData: setAddressData,
            setFieldsInteracted: jest.fn(),
          }}
        >
          {children}
        </AddressContext.Provider>
      </MunicipalitiesContext.Provider>
    </ProfileFormContext.Provider>
  );
};
