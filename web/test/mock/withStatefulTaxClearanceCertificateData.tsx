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
  const [taxClearanceCertificateData, setTaxClearanceCertificateData] = useState<TaxClearanceCertificate>(initialData);

  return (
    <TaxClearanceCertificateContext.Provider value={{
      taxClearanceCertificateState: {taxClearanceCertificateData: taxClearanceCertificateData},
      setTaxClearanceCertificateState: setTaxClearanceCertificateData,
    }}>
          {children}
    </TaxClearanceCertificateContext.Provider>
  );
};
