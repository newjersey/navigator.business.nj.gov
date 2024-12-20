import { AnytimeActionLicenseReinstatementElement } from "@/components/tasks/anytime-action/AnytimeActionLicenseReinstatementElement";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { AnytimeActionLicenseReinstatement } from "@/lib/types/types";
import {
  generateBusiness,
  generateLicenseDetails,
  generateProfileData,
  generateUserData,
} from "@businessnjgovnavigator/shared/test";
import { ReactElement } from "react";

const AnytimeActionLicenseReinstatementPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const anytimeAction = usePageData<AnytimeActionLicenseReinstatement>(props);
  const licenseName = anytimeAction.licenseName || "Health Care Services";
  const userData = generateUserData({});
  const business = generateBusiness(userData, {
    profileData: generateProfileData({ legalStructureId: undefined }),
    licenseData: {
      lastUpdatedISO: "tbd",
      licenses: {
        [licenseName]: generateLicenseDetails({
          nameAndAddress: {
            name: "Business Sample",
            addressLine1: "1 Business Way",
            addressLine2: "Suite 10",
            zipCode: "08211",
          },
          licenseStatus: "EXPIRED",
          checklistItems: [],
        }),
      },
    },
  });

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div>This file is mapped to the following license (not enabled if blank):</div>
      <div className="margin-bottom-10 text-bold">{anytimeAction.licenseName}</div>
      <AnytimeActionLicenseReinstatementElement
        anytimeActionLicenseReinstatement={anytimeAction}
        CMS_ONLY_fakeBusiness={business}
        CMS_ONLY_fakeLicenseName={licenseName}
      />
    </div>
  );
};

export default AnytimeActionLicenseReinstatementPreview;
