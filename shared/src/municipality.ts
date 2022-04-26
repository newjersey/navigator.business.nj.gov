export type Municipality = {
  readonly name: string;
  readonly displayName: string;
  readonly county: string;
  readonly id: string;
};

export type MunicipalityDetail = {
  readonly id: string;
  readonly townName: string;
  readonly townDisplayName: string;
  readonly townWebsite: string;
  readonly countyId: string;
  readonly countyName: string;
  readonly countyClerkPhone: string;
  readonly countyClerkWebsite: string;
  readonly countyWebsite: string;
};
