import React, { ReactElement, useEffect } from "react";
import { Accordion, AccordionSummary, AccordionDetails, TextField } from "@mui/material";
import { handleAccordionStateChange } from "@/lib/utils/helpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { RoadmapDefaults, SectionDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import { Icon } from "@/components/njwds/Icon";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import AdapterDayjs from "@mui/lab/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { OperateDisplayContent } from "@/lib/types/types";
import { Content } from "../Content";
dayjs.extend(advancedFormat);

interface Props {
  displayContent: OperateDisplayContent;
}

export const OperateSection = (props: Props): ReactElement => {
  const [dateValue, setDateValue] = React.useState<Dayjs>(dayjs());
  const [showDatepicker, setShowDatepicker] = React.useState<boolean>(true);
  const [showError, setShowError] = React.useState<boolean>(false);

  const { userData, update } = useUserData();
  const isOpen = userData?.preferences.roadmapOpenSections.includes("OPERATE");

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
      <div className="tablet:display-flex tablet:flex-row tablet:flex-justify margin-top-2">
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
                  "data-testid": "date-textfield",
                }}
              />
            )}
          />
        </LocalizationProvider>
        <button
          className="usa-button mla height-5 margin-top-4 tablet:margin-top-0"
          onClick={submitBusinessFormationDate}
        >
          {RoadmapDefaults.operateDateSubmitButtonText}
        </button>
      </div>
    </div>
  );

  const renderFilings = (): ReactElement => {
    if (!userData || userData.taxFilings.length === 0) return <></>;
    const annualFilingDueDate = userData.taxFilings[0].dueDate;
    const formattedDate = dayjs(annualFilingDueDate, "YYYY-MM-DD").format("MMMM Do, YYYY");

    return (
      <div className="tablet:margin-x-3">
        <Content key="annualFilingMd">{props.displayContent.annualFilingMd}</Content>
        <div className="padding-2 margin-top-4 border-base-lighter border-1px radius-md">
          <div className="display-inline tablet:display-block tablet:display-flex tablet:flex-column tablet:flex-justify">
            <div className="display-inline tablet:display-block">
              <div className="text-bold tablet:display-inline">{RoadmapDefaults.nextAnnualFilingText}</div>
              <span className="tablet:margin-left-1"> {formattedDate}</span>
            </div>
            <button
              className="usa-button usa-button--unstyled underline display-inline width-auto margin-left-2 tablet:margin-left-0"
              onClick={() => setShowDatepicker(true)}
            >
              {RoadmapDefaults.dateOfFormationEditText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div data-testid="section-operate">
      <Accordion
        elevation={0}
        expanded={isOpen}
        onChange={() => handleAccordionStateChange("OPERATE", isOpen, userData, update)}
      >
        <AccordionSummary
          expandIcon={<Icon className="usa-icon--size-5 margin-x-1">expand_more</Icon>}
          aria-controls="operate-content"
          id="operate-header"
          data-testid="operate-header"
        >
          <h2 className="flex flex-align-center margin-top-3 margin-bottom-2 tablet:margin-left-3">
            <img src={`/img/section-header-operate.svg`} alt="section" />{" "}
            <span className="padding-left-205">{SectionDefaults.OPERATE}</span>
          </h2>
        </AccordionSummary>
        <AccordionDetails>
          <div className="margin-y-3">{showDatepicker ? renderDatepicker() : renderFilings()}</div>
        </AccordionDetails>
      </Accordion>
      <hr className="margin-y-3 bg-base-lighter" />
    </div>
  );
};
