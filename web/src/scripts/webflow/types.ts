// Webflow API v2 Type Definitions

import { SectorType } from "@businessnjgovnavigator/shared/sector";

export interface WebflowItem<T = Record<string, unknown>> {
  id: string;
  fieldData: T;
}

export interface WebflowPagination {
  limit: number;
  offset: number;
  total: number;
}

export interface WebflowItemsResponse<T = Record<string, unknown>> {
  items: WebflowItem<T>[];
  pagination: WebflowPagination;
}

export interface WebflowCollectionFieldOption {
  id: string;
  name: string;
  slug: string;
}

export interface WebflowCollectionFieldValidations {
  options?: WebflowCollectionFieldOption[];
  singleLine?: boolean;
  maxLength?: number;
  format?: string;
}

export interface WebflowCollectionField {
  id: string;
  slug: string;
  displayName: string;
  type: string;
  isRequired: boolean;
  isEditable?: boolean;
  validations?: WebflowCollectionFieldValidations;
}

export interface WebflowCollection {
  id: string;
  displayName: string;
  slug: string;
  singularName?: string;
  fields: WebflowCollectionField[];
  createdOn?: string;
  lastUpdated?: string;
}

export interface WebflowCreateItemResponse extends WebflowItem {
  cmsLocaleId: string;
  lastPublished: string | null;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
}

export interface WebflowIndustryName {
  name: string;
  slug: string;
  additionalsearchterms?: string;
  description: string;
  industryquerystring: string;
}

export interface WebflowLicenseData {
  name: string;
  slug: string;
  website: string;
  "call-to-action-text": string;
  "department-3": string;
  division: string;
  "department-phone-2": string;
  "license-certification-classification": string;
  "form-name": string;
  "primary-industry": string;
  content: string;
  "last-updated": string;
  "license-classification"?: string;
  "summary-description": string;
}

export interface WebflowLicenseDataFieldData extends WebflowLicenseData {}

export interface FundingTypeOption {
  name: string;
  slug: string;
  id: string;
}

export interface FundingCertificationOption {
  name: string;
  slug: string;
  id: string;
}

export interface AgencyOption {
  name: string;
  slug: string;
  id: string;
}

export interface FundingStatusOption {
  name: string;
  slug: string;
  id: string;
}

export interface WebflowFundingFieldData {
  "program-overview": string;
  eligibility: string;
  benefit: string;
  "learn-more-url": string;
  "certifications-2": string[];
  agency: string;
  "application-close-date": string | null;
  "start-date": string | null;
  name: string;
  slug: string;
  "last-updated": string;
  "funding-status": string;
  "funding-type": string;
  "industry-reference": string[];
}

export interface WebflowLicenseFieldData {
  name: string;
  slug: string;
  website: string;
  "call-to-action-text": string;
  "department-3": string;
  division: string;
  "department-phone-2": string;
  "license-certification-classification": string;
  "form-name": string;
  "primary-industry": string;
  content: string;
  "last-updated": string;
  "license-classification"?: string;
  "summary-description": string;
}

export interface FetchResponse<T = unknown> {
  data: T;
  headers: Headers;
}

export interface SectorsJson {
  arrayOfSectors: SectorType[];
}

export interface WebflowSector {
  name: string;
  slug: string;
}

export interface WebflowSectorFieldData extends WebflowSector {
  rank?: number;
}

export interface WebflowFaqFieldData {
  name: string;
  slug: string;
  "support-post": string;
  category?: string;
  "sub-category"?: string;
  author?: string;
}

export interface WebflowImageField {
  fileId: string;
  url: string;
  alt: string | null;
}

export interface WebflowCategoryFieldData {
  name: string;
  slug: string;
  "nav-name"?: string;
  "description-text"?: string;
  "topic-description"?: string;
  "homepage-description"?: string;
}

export interface WebflowLinkField {
  url: string;
}

export interface WebflowPageFieldData {
  name: string;
  slug: string;
  category?: string;
  "sub-heading-text"?: string;
  "meta-data"?: string;
  "main-link-text"?: string;
  "primary-page"?: string;
  "heading-1"?: string;
  "main-text-1"?: string;
  "tip-1"?: string;
  "link-text-1"?: string;
  "link-1"?: WebflowLinkField | null;
  "heading-2"?: string;
  "main-text-2"?: string;
  "tip-2"?: string;
  "link-text-2"?: string;
  "link-2"?: WebflowLinkField | null;
  "heading-3"?: string;
  "main-text-3"?: string;
  "tip-3"?: string;
  "link-text-3"?: string;
  "link-3"?: WebflowLinkField | null;
  "heading-4"?: string;
  "main-text-4"?: string;
  "tip-4"?: string;
  "link-text-4"?: string;
  "link-4"?: WebflowLinkField | null;
  "heading-5"?: string;
  "main-text-5"?: string;
  "link-text-5"?: string;
  "link-5"?: WebflowLinkField | null;
  "heading-6"?: string;
  "main-text-6"?: string;
  "link-text-6"?: string;
  "link-6"?: WebflowLinkField | null;
  "heading-7"?: string;
  "main-text-7"?: string;
  "link-text-7"?: string;
  "link-7"?: WebflowLinkField | null;
  "heading-8"?: string;
  "main-text-8"?: string;
  "link-text-8"?: string;
  "link-8"?: WebflowLinkField | null;
  "heading-9"?: string;
  "main-text-9"?: string;
  "link-text-9"?: string;
  "link-9"?: WebflowLinkField | null;
  "heading-10"?: string;
  "main-text-10"?: string;
  "link-text-10"?: string;
  "link-10"?: WebflowLinkField | null;
  "heading-11"?: string;
  "main-text-11"?: string;
  "link-text-11"?: string;
  "link-11"?: WebflowLinkField | null;
}
