import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";

const fundingDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../content/src/fundings`
);

const convertFundingMd = (oppMdContents, filename) => {
  const matterResult = matter(oppMdContents);
  const oppGrayMatter = matterResult.data;

  return {
    contentMd: matterResult.content.replaceAll('"', '""'),
    filename,
    ...oppGrayMatter,
  };
};

export const loadAllFundings = () => {
  const fileNames = fs.readdirSync(fundingDir);
  return fileNames.map((fileName) => {
    return loadFundingByFileName(fileName);
  });
};

const loadFundingByFileName = (fileName) => {
  const fullPath = path.join(fundingDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertFundingMd(fileContents, fileNameWithoutMd);
};

export const exportFundings = () => {
  const fundings = loadAllFundings();
  let csvContent = `id,name,filename,urlSlug,callToActionLink,callToActionText,fundingType,programPurpose,agency,agencyContact,publishStageArchive,openDate,dueDate,status,programFrequency,businessStage,employeesRequired,homeBased,certifications,preferenceForOpportunityZone,county,sector,contentMd\n`;

  for (const funding of fundings) {
    csvContent += `"${funding.id}","${funding.name}","${funding.filename}","${funding.urlSlug}","${
      funding.callToActionLink
    }","${funding.callToActionText}","${funding.fundingType}","${funding.programPurpose}","${
      funding.agency
    }","${funding.agencyContact}","${funding.publishStageArchive}","${funding.openDate}","${
      funding.dueDate
    }","${funding.status}","${funding.programFrequency}","${funding.businessStage}","${
      funding.employeesRequired
    }","${funding.homeBased}","${funding.certifications}","${funding.preferenceForOpportunityZone}","${
      funding.county
    }","${funding.sector}","${funding.contentMd.trim()}"\n`;
  }
  fs.writeFileSync("fundings.csv", csvContent);
};

// eslint-disable-next-line no-undef
if (!process.argv.some((i) => i.includes("fundingExport")) || process.env.NODE_ENV === "test") {
  // eslint-disable-next-line no-undef
} else if (process.argv.some((i) => i.includes("--export"))) {
  exportFundings();
  // eslint-disable-next-line unicorn/no-process-exit, no-undef
  process.exit(1);
} else {
  console.log("Expected at least one argument! Use one of the following: ");
  console.log("--export = exports fundings as csv");
}
