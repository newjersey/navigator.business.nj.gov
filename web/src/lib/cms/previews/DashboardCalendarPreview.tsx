import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { FilingsCalendar } from "@/components/filings-calendar/FilingsCalendar";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateOperateReference } from "@/test/factories";
import {
  defaultDateFormat,
  generateBusiness,
  generateTaxFilingCalendarEvent,
} from "@businessnjgovnavigator/shared/index";
import {
  generatePreferences,
  generateProfileData,
  generateTaxFilingData,
} from "@businessnjgovnavigator/shared/test";
import { createTheme, ThemeProvider } from "@mui/material";
import dayjs from "dayjs";
import { ReactElement } from "react";

const DashboardCalendarPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const emptyFilingsUserData = generateBusiness({
    profileData: generateProfileData({
      operatingPhase: "UP_AND_RUNNING",
      legalStructureId: "general-partnership",
    }),
    taxFilingData: generateTaxFilingData({
      filings: [],
    }),
  });

  const filingsBusiness = generateBusiness({
    profileData: generateProfileData({
      operatingPhase: "UP_AND_RUNNING",
      legalStructureId: "general-partnership",
    }),
    taxFilingData: generateTaxFilingData({
      filings: [
        generateTaxFilingCalendarEvent({ identifier: "1", dueDate: dayjs().format(defaultDateFormat) }),
        generateTaxFilingCalendarEvent({
          identifier: "2",
          dueDate: dayjs().add(1, "month").format(defaultDateFormat),
        }),
        generateTaxFilingCalendarEvent({ identifier: "3", dueDate: dayjs().format(defaultDateFormat) }),
        generateTaxFilingCalendarEvent({ identifier: "4", dueDate: dayjs().format(defaultDateFormat) }),
      ],
    }),
  });

  const filingsBusinessGrid = {
    ...filingsBusiness,
    preferences: generatePreferences({
      isCalendarFullView: true,
    }),
  };

  const filingsBusinessList = {
    ...filingsBusiness,
    preferences: generatePreferences({
      isCalendarFullView: false,
    }),
  };

  const operateReferences = {
    "1": generateOperateReference({ name: "Tax 1" }),
    "2": generateOperateReference({ name: "Tax 2" }),
    "3": generateOperateReference({ name: "Tax 3" }),
    "4": generateOperateReference({ name: "Tax 4" }),
  };

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <ThemeProvider theme={createTheme()}>
          <h2>Empty calendar</h2>
          <FilingsCalendar operateReferences={{}} CMS_ONLY_fakeBusiness={emptyFilingsUserData} />

          <hr className="margin-top-6" />

          <h2>Calendar with filings, list view</h2>
          <FilingsCalendar
            operateReferences={operateReferences}
            CMS_ONLY_fakeBusiness={filingsBusinessList}
          />

          <hr className="margin-top-6" />

          <h2>Calendar with filings, grid view</h2>
          <FilingsCalendar
            operateReferences={operateReferences}
            CMS_ONLY_fakeBusiness={filingsBusinessGrid}
          />

          <HideableTasks />
        </ThemeProvider>
      </div>
    </ConfigContext.Provider>
  );
};

export default DashboardCalendarPreview;
