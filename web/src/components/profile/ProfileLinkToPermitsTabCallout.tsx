import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, RefObject } from "react";
import { LargeCallout } from "../njwds-extended/callout/LargeCallout";

interface Props {
  permitsRef: RefObject<HTMLDivElement | null>;
  setProfileTab: (profileTab: "permits") => void;
}

export const ProfileLinkToPermitsTabCallout = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const handleClick = (): void => {
    props.setProfileTab("permits");

    setTimeout(() => {
      if (props.permitsRef.current) {
        props.permitsRef.current.setAttribute("tabindex", "-1");
        props.permitsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        props.permitsRef.current.focus();
      }
    }, 250);
  };

  return (
    <LargeCallout
      calloutType="informational"
      showHeader
      headerText={Config.profileDefaults.fields.nonEssentialQuestions.default.linkToPermitsHeader}
    >
      {Config.profileDefaults.fields.nonEssentialQuestions.default.linkToPermitsTextBeforeButton}{" "}
      <UnStyledButton isUnderline onClick={handleClick} aria-controls="tabpanel-permits">
        {Config.profileDefaults.fields.nonEssentialQuestions.default.linkToPermitsTextButton}
      </UnStyledButton>{" "}
      {Config.profileDefaults.fields.nonEssentialQuestions.default.linkToPermitsTextAfterButton}
    </LargeCallout>
  );
};
