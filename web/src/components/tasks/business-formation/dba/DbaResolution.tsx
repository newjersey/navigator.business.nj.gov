import { type ReactElement, useContext } from "react";
import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";

export const DbaResolution = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);

  return (
    <div data-testid="resolution-step">
      <Content>{state.dbaContent.DbaResolution.summaryDescriptionMd}</Content>
      <HorizontalLine />
      <Content>{state.dbaContent.DbaResolution.contentMd}</Content>
    </div>
  );
};
