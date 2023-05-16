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

export const TaxAccessModal = (props: Props): ReactElement => {
  const [isStepOne, setIsStepOne] = useState<boolean>(true);
  const { userData } = useUserData();

  useMountEffectWhenDefined((): void => {
    if (userData?.profileData.legalStructureId) {
      setIsStepOne(false);
    }
  }, userData);

  if (isStepOne) {
    return <TaxAccessStepOne {...props} moveToNextStep={(): void => setIsStepOne(false)} />;
  } else {
    return <TaxAccessStepTwo {...props} moveToPrevStep={(): void => setIsStepOne(true)} />;
  }
};
