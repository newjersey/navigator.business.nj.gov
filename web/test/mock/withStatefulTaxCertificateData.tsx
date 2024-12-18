import { TaxCertificateContext } from "@/contexts/taxCertificateContext";;
import { FormationAddress, Municipality } from "@businessnjgovnavigator/shared/";
import { ReactElement, ReactNode, useState } from "react";

export const WithStatefulTaxCertificateData = ({
                                          children,
                                          initialData,
                                        }: {
  children: ReactNode;
  initialData: FormationAddress;
}): ReactElement => {
  const [addressData, setAddressData] = useState<FormationAddress>(initialData);

  return (
        <TaxCertificateContext.Provider
          value={{
            state: {
              formationAddressData: addressData,
            },
            setAddressData: setAddressData,
          }}
        >
          {children}
        </TaxCertificateContext.Provider>
  );
};
