import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { ReactElement, ReactNode, useContext, useEffect, useRef } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  title: string;
  children: ReactNode;
  unpaddedChildren?: ReactNode;
}

export const ModalZeroButton = (props: Props): ReactElement => {
  const { contextualInfo } = useContext(ContextualInfoContext);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dialogRef.current) {
      const firstFocusableElement = dialogRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogRef.current]);

  return (
    <Dialog
      fullWidth={false}
      maxWidth="sm"
      open={props.isOpen}
      onClose={props.close}
      aria-labelledby="dialog-modal"
      disableEnforceFocus={contextualInfo.isVisible}
      ref={dialogRef}
    >
      <div className="display-flex margin-top-1">
        <DialogTitle
          id="dialog-modal"
          className="display-flex flex-row flex-align-center break-word flex-fill"
        >
          <Heading level={0} styleVariant="h2" className="padding-x-1 margin-0-override">
            {props.title}
          </Heading>
        </DialogTitle>
        <IconButton
          aria-label="close"
          className="margin-left-auto margin-3"
          onClick={props.close}
          sx={{
            color: "#757575",
          }}
        >
          <Icon className="usa-icon--size-4">close</Icon>
        </IconButton>
      </div>
      <DialogContent sx={{ padding: 0 }} dividers>
        <div className="padding-x-4 margin-bottom-4 margin-top-2" data-testid="modal-body">
          {props.children}
        </div>
        {props.unpaddedChildren && <>{props.unpaddedChildren}</>}
      </DialogContent>
    </Dialog>
  );
};
