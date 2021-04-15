import Airtable from "airtable";

const airtableApiKey = process.env.AIRTABLE_API_KEY || "";
const airtableBaseId = process.env.AIRTABLE_BASE_ID || "";

export const selectAll = <T>(table: string, view: string): Promise<T[]> => {
  Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: airtableApiKey,
    noRetryIfRateLimited: undefined,
    apiVersion: undefined,
  });
  const base = Airtable.base(airtableBaseId);
  return new Promise((resolve, reject) => {
    const all: T[] = [];

    base(table)
      .select({ view })
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
