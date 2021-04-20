import { MunicipalityClient, MunicipalityDetail } from "../domain/types";
import Airtable from "airtable";
import { AirtableBase } from "airtable/lib/airtable_base";

export const AirtableMunicipalityClient = (
  airtableApiKey: string,
  airtableBaseId: string
): MunicipalityClient => {
  const table = "Municipalities";
  Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: airtableApiKey,
    noRetryIfRateLimited: undefined,
    apiVersion: undefined,
  });
  const base: AirtableBase = Airtable.base(airtableBaseId);

  const findAll = async (): Promise<MunicipalityDetail[]> => {
    const all: AirtableMunicipality[] = await airtableSelectAll<AirtableMunicipality>();
    return all.map(airtableToMunicipalityDetail);
  };

  const findOne = async (id: string): Promise<MunicipalityDetail> => {
    const found: AirtableMunicipality = await airtableSelectOne<AirtableMunicipality>(id);
    return airtableToMunicipalityDetail(found);
  };

  const airtableToMunicipalityDetail = (airtableMunicipality: AirtableMunicipality): MunicipalityDetail => ({
    id: airtableMunicipality.id,
    townName: airtableMunicipality.Municipality,
    townDisplayName: airtableMunicipality["Town Name"],
    townWebsite: airtableMunicipality["Town Website"],
    countyId: airtableMunicipality["County (Data)"][0],
    countyName: airtableMunicipality["County Name"][0],
    countyClerkPhone: airtableMunicipality["County Clerk Phone"][0],
    countyClerkWebsite: airtableMunicipality["County Clerks Office Webpage"][0],
    countyWebsite: airtableMunicipality["County Website"][0],
  });

  const airtableSelectAll = <T>(): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      const all: T[] = [];

      base(table)
        .select({ view: "Grid view" })
        .eachPage(
          function page(records, fetchNextPage) {
            records.forEach((record) => {
              all.push({
                id: record._rawJson.id,
                ...record._rawJson.fields,
              });
            });
            fetchNextPage();
          },
          function done(err) {
            if (err) {
              reject(err);
            } else {
              resolve(all);
            }
          }
        );
    });
  };

  const airtableSelectOne = <T>(id: string): Promise<T> => {
    return new Promise((resolve, reject) => {
      base(table).find(id, function (err, record) {
        if (err) {
          reject(err);
          return;
        }
        if (!record) {
          reject("Not found");
          return;
        }
        resolve({
          id: record._rawJson.id,
          ...record._rawJson.fields,
        });
      });
    });
  };

  return {
    findAll,
    findOne,
  };
};

export type AirtableMunicipality = {
  id: string;
  Municipality: string;
  "County (Data)": string[];
  "Town Name": string;
  "Town Website": string;
  "County Name": string[];
  "County Clerk Phone": string[];
  "County Clerks Office Webpage": string[];
  "County Website": string[];
};
