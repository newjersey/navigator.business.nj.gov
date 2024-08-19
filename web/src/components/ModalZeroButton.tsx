import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  title: string;
  children: ReactNode;
  unpaddedChildren?: ReactNode;
  uncloseable?: boolean;
}

export const ModalZeroButton = (props: Props): ReactElement => {
  const { contextualInfo } = useContext(ContextualInfoContext);
  return (
    <Dialog
      fullWidth={false}
      maxWidth="sm"
      open={props.isOpen}
      onClose={props.close}
      aria-labelledby="modal"
      disableEnforceFocus={contextualInfo.isVisible}
    >
      <DialogTitle id="modal" className="display-flex flex-row flex-align-center margin-top-1 break-word">
        <Heading level={0} styleVariant="h2" className="padding-x-1 margin-0-override">
          {props.title}
        </Heading>
        {!props.uncloseable && (
          <IconButton
            aria-label="close"
            className="margin-left-auto"
            onClick={props.close}
            sx={{
              color: "#757575",
            }}
          >
            <Icon className="usa-icon--size-4">close</Icon>
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ padding: 0 }} dividers>
        <div className="padding-x-4 margin-bottom-4 margin-top-2" data-testid="modal-body">
          {props.children}
        </div>
        {props.unpaddedChildren && <>{props.unpaddedChildren}</>}
      </DialogContent>
    </Dialog>
  );
};
