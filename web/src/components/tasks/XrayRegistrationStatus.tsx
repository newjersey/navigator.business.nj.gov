import { ReactElement } from "react";

interface Props {
  CMS_ONLY_disable_overlay?: boolean;
  onSubmit: (name: string, address: string) => void;
}

export const XrayRegistrationStatus = (props: Props): ReactElement => {
  console.log(props);
  return <></>;
};
