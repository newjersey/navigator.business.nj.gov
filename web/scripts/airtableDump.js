/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const Airtable = require("airtable");
const fs = require("fs");

// requires these env vars to be set!
const airtableApiKey = process.env.AIRTABLE_API_KEY || "";
const airtableBaseId = process.env.AIRTABLE_BASE_ID || "";

const table = "Municipalities";
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: airtableApiKey,
});

const base = Airtable.base(airtableBaseId);

const outPath = `${process.cwd()}/lib/static/records/municipalities.json`;

const saveRecords = async () => {
  const records = (await airtableSelectAll())
    .filter((it) => !!it["Town Name"])
    .map(airtableToMunicipalityDetail);
  const recordsKeyedById = {};

  for (const record of records) {
    recordsKeyedById[record.id] = record;
  }

  const json = JSON.stringify(recordsKeyedById);

  fs.writeFile(outPath, json, (err) => {
    if (err) throw err;
  });
};

const airtableToMunicipalityDetail = (airtableMunicipality) => ({
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

const airtableSelectAll = () => {
  return new Promise((resolve, reject) => {
    const all = [];

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

saveRecords();
