import {ReactElement, ReactNode, useState} from "react";
import {TaxClearanceCertificateContext } from "@/contexts/taxClearanceCertificateContext";
import {TaxClearanceCertificate} from "../../../shared/src/taxClearanceCertificate";

export const WithStatefulTaxClearanceCertificateData = ({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: TaxClearanceCertificate;
}): ReactElement => {
  const [taxClearanceCertificate, setTaxClearanceCertificate] = useState<TaxClearanceCertificate>(initialData);

  return (
    <TaxClearanceCertificateContext.Provider value={{
      taxClearanceCertificateState: {taxClearanceCertificate: taxClearanceCertificate},
      setTaxClearanceCertificateState: setTaxClearanceCertificate,
    }}>
          {children}
    </TaxClearanceCertificateContext.Provider>
  );
};
