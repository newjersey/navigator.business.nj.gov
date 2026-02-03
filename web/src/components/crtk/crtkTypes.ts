export type CrtkData = {
  lastUpdatedISO: string;
  crtkBusinessDetails?: CrtkBusinessDetails;
  crtkSearchResult: CrtkSearchResult;
  crtkEntry: CrtkEntry;
};

export type CrtkBusinessDetails = {
  businessName: string;
  addressLine1: string;
  city: string;
  addressZipCode: string;
  ein?: string;
};
export type CrtkSearchResult = "FOUND" | "NOT_FOUND";

export interface CrtkEntry {
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
  type?: string;
  status?: string;
  eligibility?: string;
  userStatus?: string;
  receivedDate?: string;
}
