import fs from "fs";
import matter from "gray-matter";
import path from "path";

const fundingDir = "../content/src/fundings";

export const convertFundingMd = (oppMdContents, filename) => {
  const matterResult = matter(oppMdContents);
  const oppGrayMatter = matterResult.data;

  return {
    contentMd: matterResult.content,
    filename: filename,
    ...oppGrayMatter,
  };
};

export const loadAllFundings = () => {
  const fileNames = fs.readdirSync(fundingDir);
  return fileNames.map((fileName) => {
    return loadFundingByFileName(fileName);
  });
};

export const loadFundingByFileName = (fileName) => {
  const fullPath = path.join(fundingDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertFundingMd(fileContents, fileNameWithoutMd);
};

const exportFundings = () => {
  const fundings = loadAllFundings();
  ///  console.log(fundings);
  const writeStream = fs.createWriteStream("fundings.csv");
  writeStream.write(
    `id,name,filename,urlSlug,callToActionLink,callToActionText,fundingType,programPurpose,agency,agencyContact,publishStageArchive,openDate,dueDate,status,programFrequency,businessStage,employeesRequired,homeBased,mwvb,preferenceForOpportunityZone,county,sector,contentMd\n`
  );
  for (const funding of fundings) {
    writeStream.write(
      `"${funding.id}","${funding.name}","${funding.filename}","${funding.urlSlug}","${
        funding.callToActionLink
      }","${funding.callToActionText}","${funding.fundingType}","${funding.programPurpose}","${
        funding.agency
      }","${funding.agencyContact}","${funding.publishStageArchive}","${funding.openDate}","${
        funding.dueDate
      }","${funding.status}","${funding.programFrequency}","${funding.businessStage}","${
        funding.employeesRequired
      }","${funding.homeBased}","${funding.mwvb}","${funding.preferenceForOpportunityZone}","${
        funding.county
      }","${funding.sector}","${funding.contentMd.trim()}"\n`
    );
  }
};

exportFundings();
