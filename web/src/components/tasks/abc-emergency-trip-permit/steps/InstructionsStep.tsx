import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const InstructionsStep = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setStepIndex } = useContext(EmergencyTripPermitContext);
  return (
    <>
      <Content>{Config.abcEmergencyTripPermit.steps.instructions.description}</Content>
      <div className={"text-bold padding-top-4"}>
        <h2>{Config.abcEmergencyTripPermit.steps.instructions.applicationHeader}</h2>
      </div>
      <Content className={"padding-bottom-2"}>
        {Config.abcEmergencyTripPermit.steps.instructions.applicationInstructionsDescription}
      </Content>
      <Content>{Config.abcEmergencyTripPermit.steps.instructions.applicationDetails}</Content>
      <div className={"float-right"}>
        <PrimaryButton
          isColor={"primary"}
          onClick={() => {
            setStepIndex(state.stepIndex + 1);
          }}
        >
          {Config.abcEmergencyTripPermit.steps.instructions.buttonText}
        </PrimaryButton>
      </div>
    </>
  );
};
