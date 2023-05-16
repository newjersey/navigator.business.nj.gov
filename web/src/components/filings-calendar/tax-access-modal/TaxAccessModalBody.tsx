import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isStepOne: boolean;
}

export const TaxAccessModalBody = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const getHeader = (): string => {
    return props.isStepOne ? Config.taxAccess.stepOneHeader : Config.taxAccess.stepTwoHeader;
  };

  return (
    <>
      <div className="margin-y-3">
        <h2 className="h4-styling">{getHeader()}</h2>
        <Content>{Config.taxAccess.body}</Content>
      </div>
      <hr className="margin-y-4" />
    </>
  );
};
