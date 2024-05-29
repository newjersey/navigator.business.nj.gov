import { ProfileFormContext } from "@/contexts/profileFormContext";
import { AddressContext } from "@/contexts/addressContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import {createProfileFieldErrorMap} from "@/lib/types/types";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import {Address} from "@businessnjgovnavigator/shared/userData";
import {Municipality} from "@businessnjgovnavigator/shared/municipality";

 const updateSpy = jest.fn();

export const WithStatefulAddressData = ({
                                          children,
                                          initialData,
                                          initialMunicipalities,
                                        }: {
  children: ReactNode;
  initialData: Address;
  initialMunicipalities?: Municipality[];
}): ReactElement => {

  const[addressData, setAddressData] = useState<Address>(initialData);
  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    updateSpy(addressData);
  }, [addressData]);

  console.log("heyyyyyy",initialMunicipalities);
  let municipalities = [{
      displayName: 'Newark Display Name',
      name: 'Newark',
      county: 'some-county-1',
      id: 'some-id-1'
  },
    {
      displayName: 'Trenton Display Name',
      name: 'Trenton',
      county: 'some-county-2',
      id: 'some-id-2'
    },];

  if(initialMunicipalities && initialMunicipalities.length>0)
  {
    municipalities = initialMunicipalities
  }

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
           setFieldsInteracted:jest.fn(),
        }}
      >
        {children}
      </AddressContext.Provider>
    </MunicipalitiesContext.Provider>
    </ProfileFormContext.Provider>
  );
};
