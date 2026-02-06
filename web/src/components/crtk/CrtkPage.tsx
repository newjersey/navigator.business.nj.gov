import { CrtkSearchResult } from "@/components/crtk/CrtkSearchResult";
import { CrtkFacilityDetails, CrtkStatus } from "@/components/crtk/CrtkStatus";
import { TaskHeader } from "@/components/TaskHeader";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { CrtkData } from "@businessnjgovnavigator/shared/crtk";
import { Task } from "@businessnjgovnavigator/shared/types";
import { Box } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  task: Task;
  CMS_ONLY_disable_overlay?: boolean;
}

export const CrtkPage = (props: Props): ReactElement => {
  const { business, refresh } = useUserData();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [crtkData, setCrtkData] = useState<CrtkData | undefined>(undefined);
  const [searchError, setSearchError] = useState<string | undefined>(undefined);
  const [lastSearchParams, setLastSearchParams] = useState<CrtkFacilityDetails | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!business) return;
    const existingCrtkData = business.crtkData;

    if (existingCrtkData?.crtkSearchResult) {
      setCrtkData(existingCrtkData);
    }
  }, [business]);

  const handleSubmit = async (facilityDetails: CrtkFacilityDetails): Promise<void> => {
    setSearchError(undefined);
    setIsLoading(true);
    setLastSearchParams(facilityDetails);

    try {
      const crtkSearchResponse = await api.searchBuisnessInCrtkDB({
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

      const updatedCrtkData: CrtkData | undefined =
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
          <CrtkSearchResult
            task={props.task}
            crtkData={crtkData}
            isLoading={isLoading}
            onSearchAgain={handleSearchAgain}
            onResubmit={handleSubmit}
          />
        ) : (
          <CrtkStatus
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
