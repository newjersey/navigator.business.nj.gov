import { ButtonIcon } from "@/components/ButtonIcon";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ReactElement } from "react";

interface Props {
  status: "text-view" | "password-view";
  toggle: () => Promise<void>;
  hideText: string;
  showText: string;
  name?: string;
  useOverrideText?: boolean;
  hideOverrideText?: string;
  showOverrideText?: string;
}

export const ShowHideToggleButton = ({
  status,
  toggle,
  hideText,
  showText,
  name,
  useOverrideText,
  hideOverrideText,
  showOverrideText,
}: Props): ReactElement => {
  const hideButtonText = () => {
    return useOverrideText ? hideOverrideText : hideText;
  };

  const showButtonText = () => {
    return useOverrideText ? showOverrideText : showText;
  };

  return (
    <UnStyledButton
      style="tertiary"
      fullWidth
      className={"padding-x-1"}
      onClick={toggle}
      dataTestid={`show-hide-toggle${name ? `-${name}` : ""}`}
    >
      <ButtonIcon svgFilename={status === "text-view" ? "hide" : "show"} />
      <span className="underline">{status === "text-view" ? hideButtonText() : showButtonText()}</span>
    </UnStyledButton>
  );
};
