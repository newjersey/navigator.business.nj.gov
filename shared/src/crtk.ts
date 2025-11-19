export type CRTKData = {
  lastUpdatedISO?: string;
  CRTKBusinessDetails?: CRTKBusinessDetails;
  CRTKSearchResult?: CRTKSearchResult;
};

export type CRTKBusinessDetails = {
  businessName: string;
  addressLine1: string;
  city: string;
  addressZipCode: string;
};

export type CRTKSearchResult = "FOUND" | "NOT_FOUND";

export interface CRTKEntry {
  businessName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ein?: string;
  facilityId?: string;
  sicCode?: string;
  naicsCode?: string;
  naicsDescription?: string;
  businessActivity?: string;
  facilityType?: string;
  facilityStatus?: string;
  eligibility?: string;
  userStatus?: string;
  receivedDate?: string;
}
