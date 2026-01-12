import { TaskHeader } from "@/components/TaskHeader";
import { CRTKStatus } from "@/components/crtk/crtkForm";
import { CRTKSearchResult } from "@/components/crtk/crtkSearchResult";
import type { CRTKData } from "@/components/crtk/crtkTypes";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@businessnjgovnavigator/shared/types";
import { Box } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import type { CRTKFacilityDetails } from "./crtkForm";

interface Props {
  task: Task;
  CMS_ONLY_disable_overlay?: boolean;
}

export const CRTKPage = (props: Props): ReactElement => {
  const { business, refresh } = useUserData();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [crtkData, setCrtkData] = useState<CRTKData | undefined>(undefined);
  const [searchError, setSearchError] = useState<string | undefined>(undefined);
  const [lastSearchParams, setLastSearchParams] = useState<CRTKFacilityDetails | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!business) return;
    const existingCrtkData = business.crtkData;

    if (existingCrtkData?.CRTKSearchResult) {
      setCrtkData(existingCrtkData);
    }
  }, [business]);

  const handleSubmit = async (facilityDetails: CRTKFacilityDetails): Promise<void> => {
    setSearchError(undefined);
    setIsLoading(true);
    setLastSearchParams(facilityDetails);

    try {
      const crtkSearchResponse = await api.searchBuisnessInCRTKDB({
        businessName: facilityDetails.businessName.trim().toUpperCase(),
        addressLine1: facilityDetails.businessStreetAddress.trim().toUpperCase(),
        city: facilityDetails.city.trim().toUpperCase(),
        addressZipCode: facilityDetails.zip.trim(),
        ein: facilityDetails.ein || undefined,
      });

      if (!crtkSearchResponse) {
        setSearchError("SEARCH_FAILED");
        return;
      }

      const updatedCrtkData: CRTKData | undefined =
        crtkSearchResponse?.businesses[crtkSearchResponse.currentBusinessId].crtkData;

      if (!updatedCrtkData) {
        setSearchError("SEARCH_FAILED");
        return;
      }

      setCrtkData(updatedCrtkData);

      await refresh();
    } catch (error) {
      console.error("CRTK lookup failed", error);
      setSearchError("SEARCH_FAILED");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchAgain = (): void => {
    setCrtkData(undefined);
    setSearchError(undefined);
  };

  return (
    <div className="flex flex-column">
      <TaskHeader task={props.task} />
      <Box sx={{ width: "100%" }}>
        {crtkData ? (
          <CRTKSearchResult
            task={props.task}
            crtkData={crtkData}
            isLoading={isLoading}
            onSearchAgain={handleSearchAgain}
          />
        ) : (
          <CRTKStatus
            task={props.task}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            searchError={searchError}
            initialValues={lastSearchParams}
          />
        )}
      </Box>
    </div>
  );
};
