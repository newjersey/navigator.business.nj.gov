import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useUnauthedOnlyPage } from "@/lib/auth/useAuthProtectedPage";
import { useMountEffect } from "@/lib/utils/helpers";
import Home from "@/pages/index";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import React, { ReactElement } from "react";

const CompleteSignin = (): ReactElement => {
  useUnauthedOnlyPage();

  useMountEffect(async () => {
    await triggerSignIn();
  });

  return (
    <>
      <Home />
      <Dialog
        fullWidth={true}
        maxWidth="md"
        open={true}
        onClose={() => {}}
        aria-labelledby="complete-signin-modal"
      >
        <DialogTitle id="complete-signin-modal">
          <div className="padding-top-1 padding-x-2 text-bold font-body-xl">
            {Defaults.selfRegistration.completeSigninTitleText}
          </div>
        </DialogTitle>
        <DialogContent>
          <div className="padding-2">
            <p className="padding-bottom-1">{Defaults.selfRegistration.completeSigninDescriptionText}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompleteSignin;
