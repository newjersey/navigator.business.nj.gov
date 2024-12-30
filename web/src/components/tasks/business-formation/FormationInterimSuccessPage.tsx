import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useRouter } from "next/compat/router";
import { ReactElement, useState } from "react";

interface Props {
  taskUrlSlug: string;
  setStepIndex: (stepIndex: number) => void;
}

export const FormationInterimSuccessPage = (props: Props): ReactElement => {
  const [showConfirmResubmitModal, setShowConfirmResubmitModal] = useState<boolean>(false);
  const { Config } = useConfig();
  const { updateQueue } = useUserData();
  const router = useRouter();

  const resetCompletedFilingPayment = (): void => {
    if (!updateQueue) {
      return;
    }

    updateQueue
      .queueFormationData({ completedFilingPayment: false })
      .update()
      .then(() => {
        props.setStepIndex(LookupStepIndexByName("Review"));
        router && router.replace({ pathname: `/tasks/${props.taskUrlSlug}` }, undefined, { shallow: true });
      });
  };

  return (
    <>
      <Alert variant="warning" dataTestid="api-error-text">
        <Content>{Config.formation.interimSuccessPage.alertText}</Content>
      </Alert>
      <Content
        customComponents={{
          button: (
            <UnStyledButton isUnderline onClick={(): void => setShowConfirmResubmitModal(true)}>
              {Config.formation.interimSuccessPage.buttonText}
            </UnStyledButton>
          ),
        }}
      >
        {Config.formation.interimSuccessPage.bodyText}
      </Content>
      <img className="maxh-card-lg margin-top-6" src={`/img/signpost.svg`} alt="" />
      <ModalTwoButton
        isOpen={showConfirmResubmitModal}
        close={(): void => setShowConfirmResubmitModal(false)}
        title={Config.formation.interimSuccessPage.modalTitle}
        primaryButtonText={Config.formation.interimSuccessPage.modalContinue}
        primaryButtonOnClick={resetCompletedFilingPayment}
        secondaryButtonText={Config.formation.interimSuccessPage.modalCancel}
      >
        <Content>{Config.formation.interimSuccessPage.modalBody}</Content>
      </ModalTwoButton>
    </>
  );
};
