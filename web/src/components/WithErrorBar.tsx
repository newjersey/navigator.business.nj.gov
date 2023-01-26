import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactNode } from "react";

interface Props {
  hasError: boolean;
  children: ReactNode | ReactNode[];
  type: "ALWAYS" | "MOBILE-ONLY" | "DESKTOP-ONLY" | "NEVER";
  className?: string;
}

export const WithErrorBar = (props: Props) => {
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const shouldShowBar = (() => {
    switch (props.type) {
      case "ALWAYS":
        return true;
      case "MOBILE-ONLY":
        return !isTabletAndUp;
      case "DESKTOP-ONLY":
        return isTabletAndUp;
      case "NEVER":
        return false;
    }
  })();

  return (
    <div
      className={`${props.className ?? ""} ${shouldShowBar ? "input-error-bar" : ""} ${
        props.hasError ? "error" : ""
      }`}
    >
      {props.children}
    </div>
  );
};
