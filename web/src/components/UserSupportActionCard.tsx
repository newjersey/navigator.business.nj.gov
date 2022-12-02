import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  color: string;
  headerLine1: string;
  headerLine2: string;
  supportingText: string;
  buttonLink: string;
  buttonText: string;
  buttonStyleProp: string;
  intercom?: boolean;
  isLast?: boolean;
}

export const UserSupportActionCard = (props: Props): ReactElement => {
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  return (
    <div
      className={`landing-card border-${props.color} border-top-105 ${
        isDesktopAndUp && !props.isLast ? "margin-right-3" : ""
      } ${!isDesktopAndUp && !props.isLast ? "margin-bottom-2" : ""}`}
    >
      <div className="flex flex-column fac space-between padding-x-2 padding-y-6 height-full">
        <div className="text-center">
          <h3 className="margin-0">{props.headerLine1}</h3>
          <h3 className="margin-bottom-3">{props.headerLine2}</h3>
          <div>{props.supportingText}</div>
        </div>
        <div>
          <Link href={props.buttonLink} passHref legacyBehavior>
            <button
              className={`usa-button usa-button margin-right-0 btn-${props.buttonStyleProp} ${
                props.intercom ? "intercom-button" : ""
              }`}
            >
              {props.buttonText}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
