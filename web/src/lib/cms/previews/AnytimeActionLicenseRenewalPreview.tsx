import { AnytimeActionLicenseRenewalElement } from "@/components/tasks/anytime-action/AnytimeActionLicenseRenewalElement";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { AnytimeActionLicenseRenewal } from "@/lib/types/types";
import {
  generateBusiness,
  generateLicenseDetails,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";
import { ReactElement } from "react";

const AnytimeActionLicenseRenewalPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const anytimeAction = usePageData<AnytimeActionLicenseRenewal>(props);
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
          licenseStatus: "ACTIVE",
          checklistItems: [],
        }),
      },
    },
  });

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div>This file is mapped to the following license (not enabled if blank):</div>
      <div className="margin-bottom-10 text-bold">{anytimeAction.licenseName}</div>
      <AnytimeActionLicenseRenewalElement
        anytimeActionLicenseRenewal={anytimeAction}
        CMS_ONLY_fakeBusiness={business}
        CMS_ONLY_fakeLicenseName={licenseName}
      />
    </div>
  );
};

export default AnytimeActionLicenseRenewalPreview;
