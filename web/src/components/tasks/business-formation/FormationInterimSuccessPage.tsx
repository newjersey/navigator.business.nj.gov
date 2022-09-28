import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

interface Props {
  taskUrlSlug: string;
  setStepIndex: (stepIndex: number) => void;
}

export const FormationInterimSuccessPage = (props: Props): ReactElement => {
  const [showConfirmResubmitModal, setShowConfirmResubmitModal] = useState<boolean>(false);
  const { Config } = useConfig();
  const { userData, update } = useUserData();
  const router = useRouter();

  const resetCompletedFilingPayment = () => {
    if (!userData) return;
    const updatedUserData = {
      ...userData,
      formationData: { ...userData.formationData, completedFilingPayment: false },
    };
    update(updatedUserData).then(() => {
      props.setStepIndex(LookupStepIndexByName("Review"));
      router.replace({ pathname: `/tasks/${props.taskUrlSlug}` }, undefined, { shallow: true });
    });
  };

  return (
    <>
      <Alert variant="warning" dataTestid="api-error-text">
        <Content>{Config.businessFormationDefaults.interimSuccessPageAlertText}</Content>
      </Alert>
      <Content
        customComponents={{
          button: (
            <Button style="tertiary" underline onClick={() => setShowConfirmResubmitModal(true)}>
              {Config.businessFormationDefaults.interimSuccessPageButtonText}
            </Button>
          ),
        }}
      >
        {Config.businessFormationDefaults.interimSuccessPageBodyText}
      </Content>
      <img className="maxh-card-lg margin-top-6" src={`/img/signpost.svg`} alt="" />
      <ModalTwoButton
        isOpen={showConfirmResubmitModal}
        close={() => setShowConfirmResubmitModal(false)}
        title={Config.businessFormationDefaults.interimSuccessPageModalTitle}
        primaryButtonText={Config.businessFormationDefaults.interimSuccessPageModalContinue}
        primaryButtonOnClick={resetCompletedFilingPayment}
        secondaryButtonText={Config.businessFormationDefaults.interimSuccessPageModalCancel}
      >
        <Content>{Config.businessFormationDefaults.interimSuccessPageModalBody}</Content>
      </ModalTwoButton>
    </>
  );
};
