import fs from "fs";
import { getAllItems } from "./methods.mjs";

const licenseCollectionId = "5e31b06cb76b830c0c358aa8";
const outDir = `${process.cwd()}/content/src/webflow-licenses`;

const saveLicenses = async () => {
  const results = await getAllItems(licenseCollectionId);
  const tasks = results.map(webflowLicenseToTask);

  for (const task of tasks) {
    const file = writeMarkdownString(task);
    fs.writeFile(`${outDir}/${task.filename}.md`, file, (err) => {
      if (err) {
        throw err;
      }
    });
  }
};

const webflowLicenseToTask = (webflowItem) => {
  return {
    id: webflowItem.slug,
    webflowId: webflowItem._id,
    name: webflowItem.name,
    urlSlug: webflowItem.slug,
    filename: webflowItem.slug,
    callToActionLink: webflowItem.website,
    callToActionText: "",
    issuingAgency: webflowItem["department-3"],
    issuingDivision: webflowItem["division"],
    divisionPhone: webflowItem["department-phone-2"],
    industryId: webflowItem["primary-industry"],
    licenseCertificationClassification: webflowItem["license-certification-classification"],
    contentMd: "",
  };
};

const writeMarkdownString = (task) => {
  return (
    `---\n` +
    `id: "${task.id}"\n` +
    `webflowId: "${task.webflowId}"\n` +
    `urlSlug: "${task.urlSlug}"\n` +
    `name: "${task.name}"\n` +
    `callToActionLink: "${task.callToActionLink}"\n` +
    `callToActionText: "${task.callToActionText}"\n` +
    `issuingAgency: "${task.issuingAgency}"\n` +
    `issuingDivision: "${task.issuingDivision}"\n` +
    `divisionPhone: "${task.divisionPhone}"\n` +
    `industryId: "${task.industryId}"\n` +
    `licenseCertificationClassification: "${task.licenseCertificationClassification}"\n` +
    `---\n` +
    `\n` +
    `${task.contentMd}`
  );
};

const main = (async () => {
  await saveLicenses();
})();

/*
 {
    'department-website': 'https://www.njcourts.gov/',
    _archived: false,
    _draft: false,
    website: 'http://njcourts.gov/public/langsrvc.html',
    'license-certification-classification': 'APPROVAL',
    'primary-industry': 'Interpreter',
    name: 'Certified Interpreter',
    'department-2': '<p>Administrative Office of the Courts Language Services Section</p>',
    'department-phone-2': '609-815-2900 ext. 52376',
    'department-website-text': 'njcourts.gov',
    slug: 'certified-interpreter',
    'updated-on': '2022-04-25T17:30:39.020Z',
    'updated-by': 'Person_5f2436776a1728e6faa4ba47',
    'created-on': '2020-10-02T13:23:47.740Z',
    'created-by': 'Person_5f2436776a1728e6faa4ba47',
    'published-on': '2022-04-25T18:08:45.060Z',
    'published-by': 'Person_5f2436776a1728e6faa4ba47',
    'department-3': 'Administrative Office of the Courts Language Services Section',
    _cid: '5e31b06cb76b830c0c358aa8',
    _id: '5f7729e4252e3daeadf5a10e'
  },
 */
