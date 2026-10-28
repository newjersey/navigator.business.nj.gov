import type { ReactElement } from "react";
import { Content } from "@/components/Content";

interface Props {
  text: string;
}

export const ProfileTabSubText = (props: Props): ReactElement => {
  return (
    <div data-testid="profile-tab-sub-text" className="margin-bottom-4">
      <Content>{props.text}</Content>
    </div>
  );
};
