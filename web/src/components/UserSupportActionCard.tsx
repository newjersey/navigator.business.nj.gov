import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton, PrimaryButtonColors } from "@/components/njwds-extended/PrimaryButton";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  borderColor: string;
  header: string;
  supportingText: string;
  buttonLink: string;
  buttonText: string;
  primaryButtonColor: PrimaryButtonColors;
  isIntercomEnabled?: boolean;
  isLast?: boolean;
}

export const UserSupportActionCard = (props: Props): ReactElement => {
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  return (
    <div
      className={`landing-card border-${props.borderColor} border-top-105 ${
        isDesktopAndUp && !props.isLast ? "margin-right-3" : ""
      } ${!isDesktopAndUp && !props.isLast ? "margin-bottom-2" : ""}`}
    >
      <div className="flex flex-column fac space-between padding-x-2 padding-y-6 height-full">
        <div className="text-center flex flex-column fac">
          <Heading level={3} className={"margin-0 width-card-lg support-action-card"}>
            {props.header}
          </Heading>
          <div>{props.supportingText}</div>
        </div>
        <div>
          <Link href={props.buttonLink}>
            <PrimaryButton
              isColor={props.primaryButtonColor}
              isRightMarginRemoved={true}
              isIntercomEnabled={props.isIntercomEnabled}
            >
              {props.buttonText}
            </PrimaryButton>
          </Link>
        </div>
      </div>
    </div>
  );
};
