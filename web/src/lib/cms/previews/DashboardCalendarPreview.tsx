import { HideableTasks } from "@/components/dashboard/HideableTasks";
import { FilingsCalendar } from "@/components/FilingsCalendar";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import {
  generateOperateReference,
  generatePreferences,
  generateProfileData,
  generateTaxFiling,
  generateTaxFilingData,
  generateUserData,
} from "@/test/factories";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/index";
import { createTheme, ThemeProvider } from "@mui/material";
import dayjs from "dayjs";

const DashboardCalendarPreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const emptyFilingsUserData = generateUserData({
    profileData: generateProfileData({
      operatingPhase: "UP_AND_RUNNING",
      legalStructureId: "general-partnership",
    }),
    taxFilingData: generateTaxFilingData({
      filings: [],
    }),
  });

  const filingsUserData = generateUserData({
    profileData: generateProfileData({
      operatingPhase: "UP_AND_RUNNING",
      legalStructureId: "general-partnership",
    }),
    taxFilingData: generateTaxFilingData({
      filings: [
        generateTaxFiling({ identifier: "1", dueDate: dayjs().format(defaultDateFormat) }),
        generateTaxFiling({ identifier: "2", dueDate: dayjs().add(1, "month").format(defaultDateFormat) }),
        generateTaxFiling({ identifier: "3", dueDate: dayjs().format(defaultDateFormat) }),
        generateTaxFiling({ identifier: "4", dueDate: dayjs().format(defaultDateFormat) }),
      ],
    }),
  });

  const filingsUserDataGrid = {
    ...filingsUserData,
    preferences: generatePreferences({
      isCalendarFullView: true,
    }),
  };

  const filingsUserDataList = {
    ...filingsUserData,
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
          <FilingsCalendar operateReferences={{}} CMS_ONLY_fakeUserData={emptyFilingsUserData} />

          <hr className="margin-top-6" />

          <h2>Calendar with filings, list view</h2>
          <FilingsCalendar
            operateReferences={operateReferences}
            CMS_ONLY_fakeUserData={filingsUserDataList}
          />

          <hr className="margin-top-6" />

          <h2>Calendar with filings, grid view</h2>
          <FilingsCalendar
            operateReferences={operateReferences}
            CMS_ONLY_fakeUserData={filingsUserDataGrid}
          />

          <HideableTasks />
        </ThemeProvider>
      </div>
    </ConfigContext.Provider>
  );
};

export default DashboardCalendarPreview;
