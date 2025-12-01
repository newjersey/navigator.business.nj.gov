import { Content } from "@/components/Content";
import { TaxAccessStepOne } from "@/components/filings-calendar/tax-access/TaxAccessStepOne";
import { TaxAccessStepTwo } from "@/components/filings-calendar/tax-access/TaxAccessStepTwo";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ReactElement, useState } from "react";

interface Props {
  onSuccess: () => void;
}

export const TaxAccess = (props: Props): ReactElement => {
  const [isStepOne, setIsStepOne] = useState<boolean>(true);
  const [hadLegalStructureOnMount, setHadLegalStructureOnMount] = useState<boolean>(false);
  const { business } = useUserData();
  const { Config } = useConfig();

  useMountEffectWhenDefined((): void => {
    if (business?.profileData.legalStructureId) {
      setIsStepOne(false);
      setHadLegalStructureOnMount(true);
    }
    analytics.event.tax_calendar.arrive.arrive_calendar_access_v2();
  }, business);

  return (
    <>
      <div>
        <Heading level={3} className="margin-0-override">
          🔔 {Config.taxAccess.taxAccessHeader}
        </Heading>
        <div className="margin-top-3">
          <Content>{Config.taxAccess.taxCalendarAccessBody}</Content>
        </div>
      </div>
      {isStepOne ? (
        <TaxAccessStepOne {...props} moveToNextStep={(): void => setIsStepOne(false)} />
      ) : (
        <TaxAccessStepTwo
          {...props}
          moveToPrevStep={(): void => setIsStepOne(true)}
          hadLegalStructureOnMount={hadLegalStructureOnMount}
        />
      )}
    </>
  );
};
