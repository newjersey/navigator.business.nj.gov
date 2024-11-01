/* eslint-disable unicorn/filename-case */
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { PrimaryButton, PrimaryButtonColors } from "@/components/njwds-extended/PrimaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  link: string;
  text?: string;
  buttonColor?: PrimaryButtonColors;
  noBackgroundColor?: boolean;
  alignLeft?: boolean;
  iconName?: string;
}

export const SingleCtaLink = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <CtaContainer noBackgroundColor={props?.noBackgroundColor || false}>
      <ActionBarLayout disableReverseOrderInMobile alignLeft={props?.alignLeft || false}>
        <PrimaryButton
          isColor={props?.buttonColor || "primary"}
          isRightMarginRemoved={true}
          onClick={(): void => {
            analytics.event.task_primary_call_to_action.click.open_external_website(
              props?.text || Config.taskDefaults.defaultCallToActionText,
              props.link as string
            );
            openInNewTab(props.link);
          }}
        >
          {props?.text || Config.taskDefaults.defaultCallToActionText}
          {props.iconName && (
            <Icon
              className="text-green usa-icon--size-3 margin-left-1 padding-bottom-05"
              iconName={props.iconName}
            />
          )}
        </PrimaryButton>
      </ActionBarLayout>
    </CtaContainer>
  );
};
