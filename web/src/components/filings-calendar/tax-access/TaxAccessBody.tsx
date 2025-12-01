import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isStepOne: boolean;
  showHeader: boolean;
}

export const TaxAccessBody = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const getHeader = (): string => {
    return props.isStepOne ? Config.taxAccess.stepOneHeader : Config.taxAccess.stepTwoHeader;
  };

  return (
    <>
      {props.showHeader && (
        <div className="margin-y-3">
          <Heading level={4} className="margin-bottom-4">
            {getHeader()}
          </Heading>
        </div>
      )}
    </>
  );
};
