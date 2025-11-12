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

export interface CRTKEntry {
  businessName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ein?: string;
  //TODO: Additional items from the request
}

export type CRTKSearchResult = "FOUND" | "NOT_FOUND";
