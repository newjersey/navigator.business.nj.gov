import { Content } from "@/components/Content";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { ReactElement, useContext } from "react";

export const DbaResolution = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);

  return (
    <div data-testid="resolution-step">
      <Content>{state.dbaContent.DbaResolution.contentMd}</Content>
    </div>
  );
};
