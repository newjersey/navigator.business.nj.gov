import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { ReactElement, useContext } from "react";

export const DbaResolution = (): ReactElement<any> => {
  const { state } = useContext(BusinessFormationContext);

  return (
    <div data-testid="resolution-step">
      <Content>{state.dbaContent.DbaResolution.summaryDescriptionMd}</Content>
      <HorizontalLine />
      <Content>{state.dbaContent.DbaResolution.contentMd}</Content>
    </div>
  );
};
