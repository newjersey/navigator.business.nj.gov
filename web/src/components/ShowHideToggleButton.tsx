import { ButtonIcon } from "@/components/ButtonIcon";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ReactElement } from "react";

export type ShowHideStatus = "text-view" | "password-view";

interface Props {
  status: ShowHideStatus;
  toggle: () => Promise<void>;
  hideText: string;
  showText: string;
  useOverrideText?: boolean;
  hideOverrideText?: string;
  showOverrideText?: string;
}

export const ShowHideToggleButton = ({
  status,
  toggle,
  hideText,
  showText,
  useOverrideText,
  hideOverrideText,
  showOverrideText,
}: Props): ReactElement => {
  const hideButtonText = (): string | undefined => {
    return useOverrideText ? hideOverrideText : hideText;
  };

  const showButtonText = (): string | undefined => {
    return useOverrideText ? showOverrideText : showText;
  };

  return (
    <UnStyledButton
      dataTestid="tax-id-show-hide-button"
      className="padding-x-1 width-100"
      onClick={toggle}
    >
      <ButtonIcon svgFilename={status === "text-view" ? "hide" : "show"} />
      <span className="underline">
        {status === "text-view" ? hideButtonText() : showButtonText()}
      </span>
    </UnStyledButton>
  );
};
