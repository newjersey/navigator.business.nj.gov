export interface CRTKData {
  CRTKSearchResult: "FOUND" | "NOT_FOUND";
  lastUpdatedISO: string;

  CRTKBusinessDetails?: {
    businessName: string;
    addressLine1: string;
    city: string;
    addressZipCode: string;
  };

  facilityId?: string;
  facilityType?: string;
  facilityStatus?: string;
  eligibility?: string;
  userStatus?: string;
  ein?: string;
  sicCode?: string;
  naicsCode?: string;
  naicsDescription?: string;
  businessActivity?: string;
  receivedDate?: string;
}
