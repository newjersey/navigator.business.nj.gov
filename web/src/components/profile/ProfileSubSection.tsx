import { Heading } from "@/components/njwds-extended/Heading";
import { ProfileTabSubText } from "@/components/profile/ProfileTabSubText";
import { ReactElement } from "react";

interface Props {
  heading: string;
  subText: string;
  children?: ReactElement;
  hideDivider?: boolean;
}

export const ProfileSubSection = (props: Props): ReactElement => {
  return (
    <>
      <div data-testid="profile-tab-header" className="margin-top-5">
        <Heading level={3} style={{ marginBottom: "0.75rem" }}>
          {props.heading}
        </Heading>
        <ProfileTabSubText text={props.subText} />
      </div>
      {props.children}
      {!props.hideDivider && (
        <hr data-testid="profile-sub-section-divider" className="margin-top-4" aria-hidden={true} />
      )}
    </>
  );
};
