/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const Airtable = require("airtable");
const fs = require("fs");

// requires these env vars to be set!
const airtableApiKey = process.env.AIRTABLE_API_KEY || "";
const airtableBaseId = process.env.AIRTABLE_BASE_ID || "";

const table = "Funding Program";
Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: airtableApiKey,
});

const base = Airtable.base(airtableBaseId);

const outDir = `${process.cwd()}/../content/src/opportunities`;

const saveRecords = async () => {
  const records = await Promise.all(
    (await airtableSelectAll())
      .filter((it) => it["Website Copy (public)"] && it["Website Copy (public)"] !== "Program Name")
      .map(airtableToOpportunity)
  );

  for (const opp of records) {
    const file = writeMarkdownString(opp);
    fs.writeFile(`${outDir}/${opp.filename}.md`, file, (err) => {
      if (err) throw err;
    });
  }
};

const airtableToOpportunity = async (airtableOpp) => {
  const { description, callToActionLink, callToActionText } = getDescriptionAndCTA(airtableOpp);
  const pipecaseName = toPipeCase(airtableOpp["Website Copy (public)"]);
  const pipecaseShortened = pipecaseName.split("-").slice(0, 3).join("-");
  return {
    name: airtableOpp["Website Copy (public)"].trim(),
    id: pipecaseName,
    filename: pipecaseShortened,
    urlSlug: pipecaseShortened,
    callToActionLink: callToActionLink,
    callToActionText: callToActionText,
    description: description,
    type: "FUNDING",
    fundingType: convertFundingType(airtableOpp["Filter: Funding Type"] ?? ""),
    benefits: airtableOpp["Benefits Summary (Public)"] ?? "",
    eligibility: airtableOpp["Eligibility- (Public)"] ?? "",
    publishStageArchive: airtableOpp["Publish/Stage/Archive"] ? airtableOpp["Publish/Stage/Archive"][0] : "",
    industry: airtableOpp["Filter: Industry"]
      ? await Promise.all(airtableOpp["Filter: Industry"].map(getIndustryById))
      : [],
    agency: airtableOpp["Agency"] ? await Promise.all(airtableOpp["Agency"].map(getAgencyById)) : [],
    openDate: airtableOpp["Open Date"] ?? "",
    dueDate: airtableOpp["Due Date"] ?? "",
    status: convertStatus(airtableOpp["Filter: Status (open// closed// ...)"]),
    programFrequency: convertProgramFrequency(airtableOpp["Filter: Program Frequency"] ?? ""),
    businessStage: convertBusinessStage(airtableOpp["Filter: Business Stage"] ?? ""),
    employeesRequired: convertemployeesRequired(airtableOpp["Filter: Business Size (Employees)"] ?? ""),
    homeBased: convertHomeBasedValues(airtableOpp["Filter: Home Base Businesses"] ?? ""),
    mwvb: convertMWVB(airtableOpp["Filter: MWVB"] ?? ""),
    preferenceForOpportunityZone:
      airtableOpp["Is preference given to businesses in an opportunity zone?"] ?? "",
    county: airtableOpp["Filter: County"] ?? [],
  };
};

const convertHomeBasedValues = (value) => {
  if (value === "yes") {
    return "yes";
  } else if (value === "no") {
    return "no";
  } else {
    return "unknown";
  }
};

const convertFundingType = (value) => {
  if (value === "Tax Credit") {
    return "tax credit";
  } else if (value === "Loan") {
    return "loan";
  } else if (value === "Grant") {
    return "grant";
  } else if (value === "Technical Assistance") {
    return "technical assistance";
  } else if (value === "Tax Exemption") {
    return "tax exemption";
  } else if (value === "hiring and employee support") {
    return "hiring and employee training support";
  } else {
    return value;
  }
};

const convertBusinessStage = (value) => {
  if (value === "VC supported technology companies" || value === "operating") {
    return "operating";
  } else if (
    value === "Angel- supported technology companies" ||
    value === "VC supported technology companies" ||
    value === "VC-supported technology companies" ||
    value === "early-stage technology" ||
    value === "startup" ||
    value === "Early Stage Business"
  ) {
    return "early-stage";
  } else {
    return "both";
  }
};

const convertProgramFrequency = (value) => {
  if (value === "Annual") {
    return "annual";
  } else if (value === "ongoning") {
    return "ongoing";
  } else if (value === "Ongoing") {
    return "ongoing";
  } else if (value === "ongoing with annual cap") {
    return "reoccuring";
  } else if (value === "ongoing with cap") {
    return "ongoing";
  } else {
    return value;
  }
};

const convertStatus = (value) => {
  if (value === "deadline\n") {
    return "deadline";
  } else if (value === "first-come, first-served\n") {
    return "first-come, first-served";
  } else if (value === "Open") {
    return "open";
  } else if (value === "Opening Soon") {
    return "opening soon";
  } else if (value === "closed\n") {
    return "closed";
  } else if (value === "open\n") {
    return "open";
  } else if (value === "first-come, first served") {
    return "first-come, first-served";
  } else {
    return value;
  }
};

const convertemployeesRequired = (value) => {
  if (value === "N/A") {
    return "n/a";
  } else {
    return value;
  }
};

const convertMWVB = (value) => {
  if (value === "mwbe\n" || value === "M/WBE") {
    return "mwbe";
  } else if (value === "n/a\n\n" || value === "no" || value === "No") {
    return "n/a";
  } else {
    return value;
  }
};

const getDescriptionAndCTA = (airtableOpp) => {
  const descriptionAndCTA = {
    callToActionLink: airtableOpp["Call to Action URL"],
    callToActionText: "Learn more",
    description: airtableOpp["Description (Public)"],
  };
  if (!descriptionAndCTA.callToActionLink.startsWith("http")) {
    descriptionAndCTA.callToActionLink = "";
    descriptionAndCTA.callToActionText = "";
    descriptionAndCTA.description = `${descriptionAndCTA.description}\n\n${airtableOpp["Call to Action URL"]}`;
  }

  return descriptionAndCTA;
};

const writeMarkdownString = (opportunity) => {
  return (
    `---\n` +
    `id: "${opportunity.id}"\n` +
    `urlSlug: "${opportunity.urlSlug}"\n` +
    `name: "${opportunity.name}"\n` +
    `callToActionLink: "${opportunity.callToActionLink}"\n` +
    `callToActionText: "${opportunity.callToActionText}"\n` +
    `type: "${opportunity.type}"\n` +
    `fundingType: "${opportunity.fundingType}"\n` +
    `benefits: "${opportunity.benefits.replace(/"/g, '\\"')}"\n` +
    `eligibility: "${opportunity.eligibility.replace(/"/g, '\\"')}"\n` +
    `publishStageArchive: "${opportunity.publishStageArchive}"\n` +
    `industry:  [${opportunity.industry.map((it) => `"${it}"`).join(",")}]\n` +
    `agency:  [${opportunity.agency.map((it) => `"${it}"`).join(",")}]\n` +
    `openDate: "${opportunity.openDate}"\n` +
    `dueDate: "${opportunity.dueDate}"\n` +
    `status: "${opportunity.status}"\n` +
    `programFrequency: "${opportunity.programFrequency}"\n` +
    `businessStage: "${opportunity.businessStage}"\n` +
    `employeesRequired: "${opportunity.employeesRequired}"\n` +
    `homeBased: "${opportunity.homeBased}"\n` +
    `mwvb: "${opportunity.mwvb}"\n` +
    `preferenceForOpportunityZone: "${opportunity.preferenceForOpportunityZone}"\n` +
    `county: [${opportunity.county.map((it) => `"${it}"`).join(",")}]\n` +
    `---\n` +
    `\n` +
    `${opportunity.description}`
  );
};

const toPipeCase = (str) => {
  return str
    .trim()
    .replace(/[@?.",/#!$%&^*;:{}+<>=\-_`~()]/g, "")
    .replace("  ", " ")
    .toLowerCase()
    .split(" ")
    .join("-");
};

const airtableSelectAll = () => {
  return new Promise((resolve, reject) => {
    const all = [];

    base(table)
      .select({ view: "Public View" })
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
            console.log(err);
            reject(err);
          } else {
            resolve(all);
          }
        }
      );
  });
};

const getIndustryById = (industryId) => {
  return new Promise((resolve, reject) => {
    base("Industry").find(industryId, function (err, record) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(record.fields.Name);
      }
    });
  });
};

const getAgencyById = (agencyId) => {
  return new Promise((resolve, reject) => {
    base("Agency").find(agencyId, function (err, record) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(record.fields.Name);
      }
    });
  });
};

saveRecords();
