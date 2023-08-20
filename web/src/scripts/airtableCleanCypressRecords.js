/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const Airtable = require("airtable");

// requires these env vars to be set!
const airtableApiKey = process.env.AIRTABLE_API_KEY || "";
const airtableBaseId = process.env.AIRTABLE_BASE_ID || "";

const table = "Users";

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: airtableApiKey,
});

const base = Airtable.base(airtableBaseId);

const deleteCypressRecords = async () => {
  const results = await airtableSelectAll();
  const cypressRecords = results.filter(isTestRecord);

  deleteRecords(cypressRecords);
};

const isTestRecord = (record) => {
  if (!record["First Name"]) {
    return false;
  }

  return (
    record["First Name"].startsWith("Michael Smith") ||
    record["First Name"].toLowerCase().includes("test") ||
    record["Email Address"].toLowerCase().includes("test")
  );
};

const deleteRecords = (records) => {
  for (let i = 0; i < records.length; i += 10) {
    const recordsToSend = records.slice(i, i + 10);
    const idsToSend = recordsToSend.map((it) => {
      return it["id"];
    });
    base(table).destroy(idsToSend, function (err, deletedRecords) {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Deleted", deletedRecords.length, "records");
    });
  }
};

const airtableSelectAll = () => {
  return new Promise((resolve, reject) => {
    const all = [];

    base(table)
      .select({ view: "All Users" })
      .eachPage(
        function page(records, fetchNextPage) {
          for (const record of records) {
            all.push({
              id: record._rawJson.id,
              ...record._rawJson.fields,
            });
          }
          fetchNextPage();
        },
        function done(err) {
          if (err) {
            reject(err);
          } else {
            resolve(all);
          }
        },
      );
  });
};

deleteCypressRecords();
