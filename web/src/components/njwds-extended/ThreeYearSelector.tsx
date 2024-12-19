import { CalendarButtonDropdown } from "@/components/njwds-extended/CalendarButtonDropdown";
import { Icon } from "@/components/njwds/Icon";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { IconButton } from "@mui/material";
import { ReactElement, ReactNode, type JSX } from "react";

const colors = {
  active: "usa-button",
  current: "usa-button usa-button--outline bg-base-lightest-hover",
  unselected: "usa-button text-base bg-white bg-base-lightest-hover",
};
type Props = {
  onChange: (year: string) => void;
  className?: string;
  activeYear: string;
  years: string[];
};
export const ThreeYearSelector = (props: Props): ReactElement<any> => {
  const getColors = (year: string): string | undefined => {
    if (year === props.activeYear) return colors["active"];
    if (year === getCurrentDate().year().toString()) return colors["current"];
    return colors["unselected"];
  };

  return (
    <div className={props.className ?? ""}>
      <IconButton
        data-testid="year-selector-left"
        aria-label="previous year"
        className={`${props.years.indexOf(props.activeYear) === 0 ? "visibility-hidden" : ""}`}
        disableFocusRipple={props.years.indexOf(props.activeYear) === 0}
        disabled={props.years.indexOf(props.activeYear) === 0}
        disableTouchRipple={props.years.indexOf(props.activeYear) === 0}
        onClick={(): void => {
          props.onChange(props.years[props.years.indexOf(props.activeYear) - 1]);
        }}
      >
        <Icon className={`usa-icon--size-3 vam text-base`} iconName="navigate_before" />
      </IconButton>
      <CalendarButtonDropdown
        dropdownOptions={props.years.map((year) => {
          return {
            text: year,
            props: { className: getColors(year) },
            onClick: () => props.onChange(year),
          };
        })}
        horizontal
        hideDivider
        name="year-selector"
        dropdownClassName="padding-x-05 bg-transparent"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wrapper={(props: { children: ReactNode; className?: string; [key: string]: any }): JSX.Element => (
          <div
            {...props}
            className={`radius-lg font-body-2xs text-normal margin-x-05 usa-button padding-05 ${props.className}`}
          />
        )}
      >
        <div className="text-base text-bold">{props.activeYear}</div>
      </CalendarButtonDropdown>
      <IconButton
        data-testid="year-selector-right"
        aria-label="next year"
        className={`${props.years.indexOf(props.activeYear) === 2 ? "visibility-hidden" : ""}`}
        disableFocusRipple={props.years.indexOf(props.activeYear) === 2}
        disabled={props.years.indexOf(props.activeYear) === 2}
        disableTouchRipple={props.years.indexOf(props.activeYear) === 2}
        onClick={(): void => {
          props.onChange(props.years[props.years.indexOf(props.activeYear) + 1]);
        }}
      >
        <Icon
          className={`usa-icon--size-3 vam text-base ${
            props.years.indexOf(props.activeYear) === 2 ? "visibility-hidden" : ""
          }`}
          iconName="navigate_next"
        />
      </IconButton>
    </div>
  );
};
