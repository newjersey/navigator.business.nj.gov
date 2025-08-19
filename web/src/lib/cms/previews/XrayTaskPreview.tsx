import { Xray } from "@/components/xray/Xray";
import { XrayTabOne } from "@/components/xray/XrayTabOne";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateXrayRegistrationData } from "@businessnjgovnavigator/shared/test";
import { Task } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

const XrayTaskPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const task = usePageData<Task>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <Xray task={task} CMS_ONLY_disable_overlay={true} />
      <hr className="margin-y-3" />
      <XrayTabOne
        xrayRegistrationData={generateXrayRegistrationData({
          status: "ACTIVE",
        })}
        error={undefined}
        isLoading={false}
        onEdit={() => {}}
        onSubmit={() => {}}
        goToRegistrationTab={() => {}}
      />
      <hr className="margin-y-3" />
      <XrayTabOne
        xrayRegistrationData={generateXrayRegistrationData({
          status: "INACTIVE",
        })}
        error={undefined}
        isLoading={false}
        onEdit={() => {}}
        onSubmit={() => {}}
        goToRegistrationTab={() => {}}
      />
      <hr className="margin-y-3" />
      <XrayTabOne
        xrayRegistrationData={generateXrayRegistrationData({
          status: "EXPIRED",
        })}
        error={undefined}
        isLoading={false}
        onEdit={() => {}}
        onSubmit={() => {}}
        goToRegistrationTab={() => {}}
      />
    </div>
  );
};

export default XrayTaskPreview;
