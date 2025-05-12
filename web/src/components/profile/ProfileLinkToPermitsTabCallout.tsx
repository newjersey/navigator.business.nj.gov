import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, RefObject } from "react";
import { Callout } from "../njwds-extended/callout/Callout";

interface Props {
  permitsRef: RefObject<HTMLDivElement>;
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
    <Callout
      calloutType="informational"
      showHeader
      headerText={Config.profileDefaults.fields.nonEssentialQuestions.default.linkToPermitsHeader}
    >
      {Config.profileDefaults.fields.nonEssentialQuestions.default.linkToPermitsTextBeforeButton}{" "}
      <UnStyledButton isUnderline onClick={handleClick} aria-controls="tabpanel-permits">
        {Config.profileDefaults.fields.nonEssentialQuestions.default.linkToPermitsTextButton}
      </UnStyledButton>{" "}
      {Config.profileDefaults.fields.nonEssentialQuestions.default.linkToPermitsTextAfterButton}
    </Callout>
  );
};
