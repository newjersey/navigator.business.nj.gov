/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const Airtable = require("airtable");
const fs = require("fs");
const path = require("path");

// requires these env vars to be set!
const airtableApiKey = process.env.AIRTABLE_API_KEY || "";
const airtableBaseId = process.env.AIRTABLE_BASE_ID || "";

const table = "Table 1";
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: airtableApiKey,
});

const base = Airtable.base(airtableBaseId);

const outDir = path.resolve(__dirname, "..", "..", "..", `content/src/filings`);

const saveRecords = async () => {
  const results = await airtableSelectAll();
  const records = results.map(airtableToOpportunity);

  for (const opp of records) {
    const file = writeMarkdownString(opp);
    fs.writeFile(`${outDir}/${opp.filename}.md`, file, (err) => {
      if (err) {
        throw err;
      }
    });
  }
};

const slugifyTaxId = (id) => {
  return id.trim().replaceAll(" ", "").replaceAll("/", "_").toLowerCase();
};

const airtableToOpportunity = (airtableOpp) => {
  const id = slugifyTaxId(airtableOpp["Form #"]);

  return {
    name: airtableOpp["Tax Name"].trim(),
    id: id,
    filename: id,
    urlSlug: id,
    treasuryLink: airtableOpp["Treasury Link"] ?? "",
    callToActionLink: airtableOpp["CTA"] ?? "",
    callToActionText: "File and Pay",
    description: airtableOpp["Description"] ?? "",
    frequency: airtableOpp["Frequncy of Filing"] ?? "",
    extension: airtableOpp["Extension Y/N"] === "Extension",
    taxRates: airtableOpp["Tax Rates"] ?? "",
    additionalInfo: airtableOpp["Additional Info"]?.trim() ?? "",
    filingMethod: convertFilingMethod(airtableOpp["Can Be filed Online (Filing Method)"] ?? ""),
    filingDetails: airtableOpp["Filing Details"]?.trim() ?? "",
    agency: airtableOpp["Managing Agency"] ?? "",
  };
};

const convertFilingMethod = (value) => {
  switch (value.toLowerCase()) {
    case "online": {
      return "online";
    }
    case "paper/by mail only": {
      return "paper-or-by-mail-only";
    }
    case "online filing required": {
      return "online-required";
    }
    case "online or phone": {
      return "online-or-phone";
    }
    default: {
      return toPipeCase(value);
    }
  }
};

const writeMarkdownString = (opportunity) => {
  return (`---\n` +
  `id: "${opportunity.id}"\n` +
  `urlSlug: "${opportunity.urlSlug}"\n` +
  `name: "${opportunity.name}"\n` +
  `callToActionLink: "${opportunity.callToActionLink}"\n` +
  `callToActionText: "${opportunity.callToActionText}"\n` +
  `treasuryLink: "${opportunity.treasuryLink}"\n` +
  `extension: "${opportunity.extension}"\n` +
  `frequency: "${opportunity.frequency?.replace(/"/g, '\\"')}"\n` +
  `taxRates: "${opportunity.taxRates?.replace(/"/g, '\\"')}"\n` +
  `additionalInfo: "${opportunity.additionalInfo?.replace(/"/g, '\\"')}"\n` +
  `filingMethod: "${opportunity.filingMethod}"\n` +
  `filingDetails: "${opportunity.filingDetails?.replace(/"/g, '\\"')}"\n` +
  `agency: "${opportunity.agency}"\n` +
  `---\n` +
  `\n` + `${opportunity.description}`);
};

const toPipeCase = (str) => {
  return str
    .trim()
    .replaceAll(/[!"#$%&()*+,./:;<=>?@^_`{}~-]/g, "")
    .replace("  ", " ")
    .toLowerCase()
    .split(" ")
    .join("-");
};

const airtableSelectAll = () => {
  return new Promise((resolve, reject) => {
    const all = [];

    base(table)
      .select({ view: "Grid view" })
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
            console.log(err);
            reject(err);
          } else {
            resolve(all);
          }
        }
      );
  });
};

saveRecords();
