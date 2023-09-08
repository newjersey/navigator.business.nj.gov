import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Icon } from "@/components/njwds/Icon";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

export const SignUpModal = (): ReactElement => {
  const { business } = useUserData();
  const router = useRouter();
  const { isAuthenticated, showNeedsAccountModal, setShowNeedsAccountModal } =
    useContext(NeedsAccountContext);

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
      open={showNeedsAccountModal}
      maxWidth="xs"
      onClose={(): void => setShowNeedsAccountModal(false)}
      data-testid={"self-reg-modal"}
    >
      <DialogTitle sx={{ p: 5, paddingRight: 10 }}>
        <div role="heading" aria-level={2} className="h3-styling">
          {Config.navigationDefaults.guestModalTitle}
        </div>
        <IconButton
          aria-label="close"
          onClick={(): void => setShowNeedsAccountModal(false)}
          sx={{
            position: "absolute",
            right: 10,
            top: 12,
            color: "#757575",
          }}
        >
          <Icon className="usa-icon--size-4">close</Icon>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers={false} sx={{ paddingX: 5, paddingBottom: 3 }}>
        <Content>{Config.navigationDefaults.guestModalBody}</Content>
      </DialogContent>
      <DialogContent dividers={false} sx={{ paddingX: 5 }}>
        <Box>
          <PrimaryButton isColor="primary" isFullWidthOnDesktop onClick={linkToAccountSetup}>
            {Config.navigationDefaults.guestModalButtonText}
          </PrimaryButton>
        </Box>
      </DialogContent>

      <DialogContent dividers={true} sx={{ paddingX: 5 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            marginX: "auto",
            width: "fit-content",
            marginY: 1,
          }}
        >
          <Content
            onClick={(): void => {
              analytics.event.guest_modal.click.go_to_myNJ_login();
              triggerSignIn();
            }}
          >
            {Config.navigationDefaults.guestModalSubText}
          </Content>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
