import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/compat/router";
import { ReactElement } from "react";

interface Props {
  isCTAButtonHidden?: boolean;
}
export const LockedTasksPrompt = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const router = useRouter();

  return (
    <div className={"prompt-border padding-3 margin-top-2"}>
      <div className={isDesktopAndUp ? "flex flex-row flex-align-start" : ""}>
        <div className={isDesktopAndUp ? "flex-fill margin-right-2" : ""}>
          <div>
            <Content>{Config.lockedTasksPrompt.promptText}</Content>
          </div>
        </div>
        {!props.isCTAButtonHidden && (
          <div className={isDesktopAndUp ? "flex-auto" : "margin-top-2"}>
            <PrimaryButton
              isColor="primary"
              isRightMarginRemoved
              isFullWidthOnDesktop
              onClick={(): void => {
                router && router.push(`/account-setup`);
              }}
            >
              {Config.lockedTasksPrompt.buttonText}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};
