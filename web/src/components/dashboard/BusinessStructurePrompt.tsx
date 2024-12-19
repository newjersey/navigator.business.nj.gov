import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { MediaQueries } from "@/lib/PageSizes";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import { businessStructureTaskId } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  isCTAButtonHidden?: boolean;
}
export const BusinessStructurePrompt = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const router = useRouter();
  const { roadmap } = useRoadmap();

  const businessStructureUrlSlug = roadmap
    ? (getTaskFromRoadmap(roadmap, businessStructureTaskId)?.urlSlug as string)
    : "";

  return (
    <div
      className={"business-structure-prompt-border padding-3 margin-top-2"}
      data-testid={"business-structure-prompt"}
    >
      <div className={isDesktopAndUp ? "flex flex-row flex-align-start" : ""}>
        <div className={isDesktopAndUp ? "flex-fill margin-right-2" : ""}>
          {router.asPath === `/tasks/${businessStructureUrlSlug}` ? (
            <div data-testid={"content-when-on-business-structure-task"}>
              <Content>{Config.businessStructurePrompt.notCompletedTaskPromptBusinessStructureTask}</Content>
            </div>
          ) : (
            <div data-testid={"content-when-not-on-business-structure-task"}>
              <Content>{Config.businessStructurePrompt.notCompletedTaskPromptAnyTask}</Content>
            </div>
          )}
        </div>
        {!props.isCTAButtonHidden && (
          <div className={isDesktopAndUp ? "flex-auto" : "margin-top-2"}>
            <PrimaryButton
              isColor="primary"
              isRightMarginRemoved
              isFullWidthOnDesktop
              onClick={(): void => {
                router.push(`/tasks/${businessStructureUrlSlug}`);
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
