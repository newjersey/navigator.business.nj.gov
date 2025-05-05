import { ReactElement } from "react";

interface Props {
  text: string;
}

export const ProfileTabSubText = (props: Props): ReactElement => {
  return (
    <div data-testid="profile-tab-sub-text" className="margin-bottom-4">
      {props.text}
    </div>
  );
};
