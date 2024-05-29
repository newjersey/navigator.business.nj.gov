import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isStepOne: boolean;
  showHeader: boolean;
}

export const TaxAccessModalBody = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const getHeader = (): string => {
    return props.isStepOne ? Config.taxAccess.stepOneHeader : Config.taxAccess.stepTwoHeader;
  };

  return (
    <>
      <div className="margin-y-3">
        {props.showHeader && (
          <Heading level={2} styleVariant="h4">
            {getHeader()}
          </Heading>
        )}
        <Content>{props.isStepOne ? Config.taxAccess.stepOneBody : Config.taxAccess.stepTwoBody}</Content>
      </div>
      <hr className="margin-y-4" />
    </>
  );
};
