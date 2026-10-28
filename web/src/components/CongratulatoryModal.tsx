import type { SectionType } from "@businessnjgovnavigator/shared";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { useRouter } from "next/compat/router";
import type { ReactElement } from "react";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ROUTES } from "@/lib/domain-logic/routes";

interface Props {
  nextSectionType: SectionType | undefined;
  open: boolean;
  handleClose: () => void;
}

export const CongratulatoryModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const router = useRouter();

  const onClickComplete = (): void => {
    router && router.push(ROUTES.dashboard);
  };

  const publicName = props.nextSectionType ? Config.sectionHeaders[props.nextSectionType] : "";
  const hideLink = !props.nextSectionType;

  return (
    <Dialog
      open={props.open}
      maxWidth="sm"
      fullWidth
      onClose={props.handleClose}
      data-testid={"congratulatory-modal"}
    >
      <DialogContent
        style={{
          textAlign: "center",
          backgroundColor: "#538200",
          color: "white",
        }}
      >
        <IconButton
          aria-label="close"
          onClick={props.handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#757575",
          }}
        >
          <Icon className="usa-icon--size-4 text-white" iconName="close" />
        </IconButton>
        <div>
          <img
            src={`/img/congratulations.svg`}
            alt="section"
            style={{ marginTop: "33px", marginBottom: "33px", width: "98px", height: "99px" }}
          />
          <div style={{ fontWeight: 700, fontSize: "26px", lineHeight: "30.55px" }}>
            {Config.dashboardDefaults.congratulatoryModalTitle}
          </div>
          <div
            style={{
              margin: "25px 46px 46px",
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "23.5px",
              letterSpacing: "2.5%",
            }}
          >
            {Config.dashboardDefaults.congratulatoryModalHeader}
            <br />
            {!hideLink && (
              <>
                {Config.dashboardDefaults.congratulatoryModalBody}{" "}
                <button
                  type="button"
                  onClick={(): void => onClickComplete()}
                  className="clear-button text-white text-underline"
                  style={{
                    fontWeight: 700,
                    fontSize: "20px",
                    lineHeight: "23.5px",
                    letterSpacing: "2.5%",
                    cursor: "pointer",
                  }}
                >
                  {publicName} {Config.dashboardDefaults.congratulatoryModalLinkText}
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
