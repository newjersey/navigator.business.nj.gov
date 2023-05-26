import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ROUTES } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  isButtonHidden?: boolean;
}
export const BusinessStructurePrompt = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const router = useRouter();

  return (
    <div
      className={"business-structure-prompt-border padding-3 margin-top-2"}
      data-testid={"business-structure-prompt"}
    >
      <div className={isDesktopAndUp ? "flex flex-row flex-align-start" : ""}>
        <div className={isDesktopAndUp ? "flex-fill margin-right-2" : "margin-bottom-2"}>
          {router.asPath === ROUTES.businessStructureTask ? (
            <div data-testid={"business-structure-task-content"}>
              <Content>{Config.businessStructurePrompt.notCompletedTaskPromptBusinessStructureTask}</Content>
            </div>
          ) : (
            <div data-testid={"any-task-content"}>
              <Content>{Config.businessStructurePrompt.notCompletedTaskPromptAnyTask}</Content>
            </div>
          )}
        </div>
        {!props.isButtonHidden && (
          <div className={isDesktopAndUp ? "flex-auto" : ""}>
            <PrimaryButton
              isColor="primary"
              isRightMarginRemoved
              isFullWidthOnDesktop
              onClick={(): void => {
                router.push(ROUTES.businessStructureTask);
              }}
              dataTestId={"business-structure-prompt-button"}
            >
              {Config.businessStructurePrompt.buttonText}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};
