import { AddressContext } from "@/contexts/addressContext";
import { createDataFieldErrorMap, DataFieldFormContext } from "@/contexts/dataFieldFormContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
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
  const { state: formContextState } = useFormContextHelper(createDataFieldErrorMap());

  return (
    <DataFieldFormContext.Provider value={formContextState}>
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
    </DataFieldFormContext.Provider>
  );
};
