import { PassengerTransportCdl } from "@/components/tasks/passenger-transport-cdl/PassengerTransportCdl";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { TaskWithLicenseTaskId } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

const PassengerTransportCdlPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const { config, setConfig } = usePreviewConfig(props);
  const task = {
    ...usePageData<TaskWithLicenseTaskId>(props),
    name: "Name is controlled by Task Metadata",
  };

  const tab = props.entry.toJS().slug.split("-")[3];

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40 }}>
        <div className="margin-bottom-5">
          Header can be changed by updating the passenger-transport-cdl.md file within task-all
        </div>
        {tab === "tab1" ? (
          <PassengerTransportCdl task={task} CMS_ONLY_show_error />
        ) : (
          <>
            <div className="margin-bottom-7">
              <PassengerTransportCdl
                task={task}
                CMS_ONLY_show_tab_2
                CMS_ONLY_school_bus_radio_value={true}
                CMS_ONLY_passengers_radio_value={true}
              />
            </div>
            <div className="margin-bottom-7">
              <PassengerTransportCdl
                task={task}
                CMS_ONLY_show_tab_2
                CMS_ONLY_school_bus_radio_value={true}
                CMS_ONLY_passengers_radio_value={false}
              />
            </div>
            <div className="margin-bottom-7">
              <PassengerTransportCdl
                task={task}
                CMS_ONLY_show_tab_2
                CMS_ONLY_school_bus_radio_value={false}
                CMS_ONLY_passengers_radio_value={true}
              />
            </div>
            <div className="margin-bottom-7">
              <PassengerTransportCdl
                task={task}
                CMS_ONLY_show_tab_2
                CMS_ONLY_school_bus_radio_value={false}
                CMS_ONLY_passengers_radio_value={false}
              />
            </div>
          </>
        )}
      </div>
    </ConfigContext.Provider>
  );
};

export default PassengerTransportCdlPreview;
