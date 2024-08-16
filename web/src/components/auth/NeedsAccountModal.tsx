import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Icon } from "@/components/njwds/Icon";
import { ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

export const NeedsAccountModal = (): ReactElement => {
  const { business } = useUserData();
  const router = useRouter();
  const { isAuthenticated, showNeedsAccountModal, setShowNeedsAccountModal } =
    useContext(NeedsAccountContext);
  const { Config } = useConfig();
  const { contextualInfo } = useContext(ContextualInfoContext);

  useMountEffectWhenDefined(() => {
    if (isAuthenticated === IsAuthenticated.TRUE) {
      setShowNeedsAccountModal(false);
    }
  }, isAuthenticated);

  if (isAuthenticated === IsAuthenticated.TRUE) {
    return <></>;
  }

  const linkToAccountSetup = (): void => {
    if (business?.preferences.returnToLink === `${ROUTES.dashboard}?${QUERIES.openTaxFilingsModal}=true`) {
      analytics.event.myNJ_prompt_modal_complete_button.click.go_to_NavigatorAccount_setup();
    } else {
      analytics.event.guest_modal.click.go_to_NavigatorAccount_setup();
    }
    setShowNeedsAccountModal(false);
    router.push(ROUTES.accountSetup);
  };

  return (
    <Dialog
      fullWidth={false}
      open={showNeedsAccountModal}
      maxWidth="sm"
      onClose={(): void => setShowNeedsAccountModal(false)}
      data-testid={"self-reg-modal"}
      aria-labelledby="modal"
      disableEnforceFocus={contextualInfo.isVisible}
    >
      <DialogTitle id="modal" className="display-flex flex-row flex-align-center margin-top-1 break-word">
        <Heading level={0} styleVariant="h2" className="padding-x-1 margin-0-override">
          {Config.selfRegistration.needsAccountModalTitle}
        </Heading>
        <IconButton
          aria-label="close"
          className="margin-left-auto"
          onClick={(): void => setShowNeedsAccountModal(false)}
          sx={{
            color: "#757575",
          }}
        >
          <Icon className="usa-icon--size-4">close</Icon>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: 0 }} dividers>
        <div className="padding-x-4 margin-bottom-4 margin-top-2" data-testid="modal-body">
          <Content>{Config.selfRegistration.needsAccountModalBody}</Content>
          <Box>
            <div className="margin-top-3">
              <PrimaryButton isColor="primary" isFullWidthOnDesktop onClick={linkToAccountSetup}>
                {Config.selfRegistration.needsAccountModalButtonText}
              </PrimaryButton>
            </div>
          </Box>
        </div>
      </DialogContent>

      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            marginX: "auto",
            width: "fit-content",
            marginY: 1,
            paddingX: 5,
          }}
        >
          <Content
            onClick={(): void => {
              analytics.event.guest_modal.click.go_to_myNJ_login();
              triggerSignIn();
            }}
          >
            {Config.selfRegistration.needsAccountModalSubText}
          </Content>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
