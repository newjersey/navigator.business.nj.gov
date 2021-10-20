import React, { ReactElement, useEffect } from "react";
import { TextField } from "@mui/material";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { RoadmapDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import AdapterDayjs from "@mui/lab/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { FilingReference, OperateDisplayContent } from "@/lib/types/types";
import { Content } from "../Content";
import { FilingsCalendar } from "@/components/roadmap/FilingsCalendar";
import { SectionAccordion } from "@/components/roadmap/SectionAccordion";

dayjs.extend(advancedFormat);

interface Props {
  displayContent: OperateDisplayContent;
  filingsReferences: Record<string, FilingReference>;
}

export const OperateSection = (props: Props): ReactElement => {
  const [dateValue, setDateValue] = React.useState<Dayjs>(dayjs());
  const [showDatepicker, setShowDatepicker] = React.useState<boolean>(true);
  const [showError, setShowError] = React.useState<boolean>(false);

  const { userData, update } = useUserData();

  useEffect(
    function showFilingsWhenTheyExist() {
      if (userData && userData.onboardingData.dateOfFormation && userData.taxFilings.length > 0) {
        setShowDatepicker(false);
      }
    },
    [setShowDatepicker, userData, userData?.taxFilings.length, userData?.onboardingData.dateOfFormation]
  );

  useEffect(
    function setDatepickerValueToUserValue() {
      if (userData?.onboardingData.dateOfFormation) {
        setDateValue(dayjs(userData?.onboardingData.dateOfFormation, "YYYY-MM-DD"));
      }
    },
    [userData?.onboardingData.dateOfFormation, showDatepicker]
  );

  const submitBusinessFormationDate = () => {
    if (!userData) return;

    if (!dateValue || !dateValue.isValid() || showError) return;

    update({
      ...userData,
      onboardingData: {
        ...userData.onboardingData,
        dateOfFormation: dateValue.startOf("month").format("YYYY-MM-DD"),
      },
      taxFilings: [],
    });
  };

  const renderDatepicker = (): ReactElement => (
    <div className="padding-x-3 padding-top-3 padding-bottom-105 border-base-lighter border-1px radius-md">
      <Content key="dateOfFormationMd">{props.displayContent.dateOfFormationMd}</Content>
      <div className="mobile-lg:display-flex mobile-lg:flex-row mobile-lg:flex-justify margin-top-2">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            views={["year", "month"]}
            label=""
            minDate={dayjs("1970-01-01")}
            maxDate={dayjs()}
            value={dateValue}
            inputFormat={"MM/YYYY"}
            onChange={(newValue: Dayjs | null): void => {
              if (newValue) {
                setDateValue(newValue);
              }
            }}
            onError={(hasError: string | null) => {
              setShowError(!!hasError);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                helperText={showError ? RoadmapDefaults.dateOfFormationErrorText : " "}
                inputProps={{
                  ...params.inputProps,
                  "data-testid": "date-of-formation-textfield",
                }}
              />
            )}
          />
        </LocalizationProvider>
        <button
          className="usa-button mla height-5 margin-top-2 mobile-lg:margin-top-0"
          onClick={submitBusinessFormationDate}
          data-testid="date-of-formation-submit-button"
        >
          {RoadmapDefaults.operateDateSubmitButtonText}
        </button>
      </div>
    </div>
  );

  const renderFilings = (): ReactElement => {
    return (
      <div className="tablet:margin-x-3">
        <Content key="annualFilingMd">{props.displayContent.annualFilingMd}</Content>
        <p>
          {RoadmapDefaults.dateOfFormationHelperText}{" "}
          <button
            className="usa-button usa-button--unstyled underline"
            onClick={() => setShowDatepicker(true)}
          >
            {RoadmapDefaults.dateOfFormationEditText}
          </button>
        </p>

        <FilingsCalendar
          taxFilings={userData?.taxFilings || []}
          filingsReferences={props.filingsReferences}
        />
      </div>
    );
  };

  return (
    <SectionAccordion sectionType="OPERATE">
      <div className="margin-y-3">{showDatepicker ? renderDatepicker() : renderFilings()}</div>
    </SectionAccordion>
  );
};
