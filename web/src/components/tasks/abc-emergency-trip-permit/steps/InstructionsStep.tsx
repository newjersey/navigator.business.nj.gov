import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const InstructionsStep = (): ReactElement => {
  const { Config } = useConfig();
  return (
    <>
      <Content>{Config.abcEmergencyTripPermit.steps.instructions.description}</Content>
      <div className={"text-bold padding-top-4"}>
        <h2>{Config.abcEmergencyTripPermit.steps.instructions.applicationHeader}</h2>
      </div>
      <Content className={"padding-bottom-2"}>
        {Config.abcEmergencyTripPermit.steps.instructions.applicationInstructionsDescription}
      </Content>
      <Content className={"padding-bottom-2"}>
        {Config.abcEmergencyTripPermit.steps.instructions.applicationDetails}
      </Content>
      <div>
        <Content>{Config.abcEmergencyTripPermit.steps.instructions.helpText}</Content>
      </div>
    </>
  );
};
