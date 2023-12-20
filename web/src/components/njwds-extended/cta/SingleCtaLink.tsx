/* eslint-disable unicorn/filename-case */
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  link: string;
  text: string;
}

export const SingleCtaLink = ({ link, text }: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <CtaContainer>
      <ActionBarLayout>
        <PrimaryButton
          isColor="primary"
          isRightMarginRemoved={true}
          onClick={(): void => {
            analytics.event.task_primary_call_to_action.click.open_external_website(
              text || Config.taskDefaults.defaultCallToActionText,
              link as string
            );
            openInNewTab(link);
          }}
        >
          {text || Config.taskDefaults.defaultCallToActionText}
        </PrimaryButton>
      </ActionBarLayout>
    </CtaContainer>
  );
};
