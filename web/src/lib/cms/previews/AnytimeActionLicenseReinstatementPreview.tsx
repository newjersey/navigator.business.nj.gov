import {
  generateBusiness,
  generateLicenseDetails,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";
import type { AnytimeActionLicenseReinstatement } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import { AnytimeActionLicenseReinstatementElement } from "@/components/tasks/anytime-action/AnytimeActionLicenseReinstatementElement";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";

const AnytimeActionLicenseReinstatementPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const anytimeAction = usePageData<AnytimeActionLicenseReinstatement>(props);
  const licenseName = anytimeAction.licenseName || "Health Care Services";
  const business = generateBusiness({
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
