export type CrtkData = {
  lastUpdatedISO: string;
  crtkBusinessDetails?: CrtkBusinessDetails;
  crtkSearchResult: CrtkSearchResult;
  crtkEntry: CrtkEntry;
  crtkEmailSent?: boolean;
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
  facilityStatus?: string;
  eligibility?: string;
  status?: string;
  receivedDate?: string;
}

export interface CrtkEmailMetadata {
  username: string;
  email: string;
  businessName: string;
  businessStatus: string;
  businessAddress: string;
  industry: string;
  ein: string;
  naicsCode: string;
  businessActivities: string;
  materialOrProducts: string;
}
