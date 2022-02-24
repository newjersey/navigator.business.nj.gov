import { RoadmapDefaults } from "@/display-defaults/roadmap/RoadmapDefaults";
import { SectionType } from "@/lib/types/types";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement } from "react";
import { Icon } from "./njwds/Icon";

interface Props {
  nextSectionType: SectionType | undefined;
  open: boolean;
  handleClose: () => void;
}

export const CongratulatoryDialog = (props: Props): ReactElement => {
  const router = useRouter();
  const onClickComplete = () => router.push("/roadmap");

  const publicName = props.nextSectionType ? Defaults.sectionHeaders[props.nextSectionType] : "";
  const hideLink = !props.nextSectionType || props.nextSectionType === "OPERATE";

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
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Icon className="usa-icon--size-4">close</Icon>
        </IconButton>
        <div>
          <img
            src={`/img/congratulations.svg`}
            alt="section"
            style={{ marginTop: "33px", marginBottom: "33px", width: "98px", height: "99px" }}
          />
          <div style={{ fontWeight: 700, fontSize: "26px", lineHeight: "30.55px" }}>
            {RoadmapDefaults.congratulatorModalTitle}
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
            {RoadmapDefaults.congratulatorModalHeader}
            <br />
            {!hideLink && (
              <>
                {RoadmapDefaults.congratulatorModalBody}{" "}
                <span
                  role={"button"}
                  tabIndex={0}
                  onClick={() => onClickComplete()}
                  onKeyDown={() => onClickComplete()}
                  className="text-underline"
                  style={{
                    fontWeight: 700,
                    fontSize: "20px",
                    lineHeight: "23.5px",
                    letterSpacing: "2.5%",
                    cursor: "pointer",
                  }}
                >
                  {publicName} {RoadmapDefaults.congratulatorModalLinkText}
                </span>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
