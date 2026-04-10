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
  "navbar-order"?: number;
  "customized-drop-down-link-filter"?: string;
  "bg-image"?: WebflowImageField;
  "topic-icon"?: WebflowImageField;
  "mobile-icon"?: WebflowImageField;
  "topic-icon-white-bg"?: WebflowImageField;
  "topic-icon-cat-page"?: WebflowImageField;
  arrow?: WebflowImageField;
  "icon-accessibility-alt-description"?: string;
  "topic-color"?: string;
  "topic-description"?: string;
  "homepage-description"?: string;
  "nav-promo-hero-button-text"?: string;
  "navigator-promotion-image"?: WebflowImageField;
  "nav-promo-heading"?: string;
  "nav-promo-description"?: string;
  "nav-promo-button-text"?: string;
  "navigation-promotion-color"?: string;
  "navigation-tile-border-color"?: string;
  "nav-promo-text-color-2"?: string;
  "category-page-tile-background"?: string;
  "category-page-header"?: string;
  "category-page-promo-text"?: string;
  "side-nav-hover-color"?: string;
  "side-nav-background-color"?: string;
  "side-nav-active-color"?: string;
}
