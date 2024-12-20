import { TaxAccessStepOne } from "@/components/filings-calendar/tax-access-modal/TaxAccessStepOne";
import { TaxAccessStepTwo } from "@/components/filings-calendar/tax-access-modal/TaxAccessStepTwo";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ReactElement, useState } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSuccess: () => void;
}

export const TaxAccessModal = (props: Props): ReactElement<any> => {
  const [isStepOne, setIsStepOne] = useState<boolean>(true);
  const { business } = useUserData();

  useMountEffectWhenDefined((): void => {
    if (business?.profileData.legalStructureId) {
      setIsStepOne(false);
    }
  }, business);

  if (isStepOne) {
    return <TaxAccessStepOne {...props} moveToNextStep={(): void => setIsStepOne(false)} />;
  } else {
    return <TaxAccessStepTwo {...props} moveToPrevStep={(): void => setIsStepOne(true)} />;
  }
};
