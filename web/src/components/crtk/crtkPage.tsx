import { TaskHeader } from "@/components/TaskHeader";
import { CRTKStatus } from "@/components/crtk/crtkForm";
import { CRTKSearchResult } from "@/components/crtk/crtkSearchResult";

import { Task, XrayRenewalCalendarEventType } from "@businessnjgovnavigator/shared/types";
import { Box } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  task: Task;
  renewal?: XrayRenewalCalendarEventType;
  CMS_ONLY_disable_overlay?: boolean;
}

export const CRTKPage = (props: Props): ReactElement => {
  //  const { Config } = useConfig();
  // const { roadmap } = useRoadmap();
  //const { business, refresh } = useUserData();

  // const [, setIsLoading] = useState<boolean>(false);
  // const [, setXrayRegistrationData] = useState<XrayData | undefined>(undefined);

  // useEffect(() => {
  //   if (!business) return;

  //   const hasValidData = business?.xrayRegistrationData?.status;

  //   if (hasValidData) {
  //     setTabIndex(STATUS_TAB_INDEX);
  //     setXrayRegistrationData(business.xrayRegistrationData);
  //   }
  // }, [business]);

  // const goToRegistrationTab = (): void => {
  //   setTabIndex(APPLICATION_TAB_INDEX);
  // };

  // const onSelectTab = (event: React.SyntheticEvent, newValue: string): void => {
  //   const index = Number.parseInt(newValue);
  //   setTabIndex(index);
  // };

  // const allFieldsHaveValues = (facilityDetails: FacilityDetails): boolean => {
  //   return !!(
  //     facilityDetails.businessName &&
  //     facilityDetails.addressLine1 &&
  //     facilityDetails.addressZipCode
  //   );
  // };

  // const onSubmit = (facilityDetails: FacilityDetails): void => {
  //   setError(undefined);
  //   if (!allFieldsHaveValues(facilityDetails)) {
  //     setError("FIELDS_REQUIRED");
  //     return;
  //   }

  //   setIsLoading(true);
  //   api
  //     .checkXrayRegistrationStatus(facilityDetails)
  //     .then((userData: UserData) => {
  //       const xrayRegistrationData =
  //         userData.businesses[userData.currentBusinessId].xrayRegistrationData;
  //       if (!xrayRegistrationData?.status && xrayRegistrationData?.machines?.length === 0) {
  //         setError("NOT_FOUND");
  //         setIsLoading(false);
  //         return;
  //       }
  //       setXrayRegistrationData(xrayRegistrationData);
  //     })
  //     .catch(() => {
  //       setError("SEARCH_FAILED");
  //     })
  //     .finally(async () => {
  //       //refresh();
  //       setIsLoading(false);
  //     });
  // };

  return (
    <div className="flex flex-column">
      <TaskHeader task={props.task} />
      <Box sx={{ width: "100%" }}>
        {Math.random() > 0.5 ? (
          <CRTKStatus task={props.task} onSubmit={() => {}} isLoading={false} />
        ) : (
          <CRTKSearchResult task={props.task} isLoading={false} />
        )}
      </Box>
    </div>
  );
};
