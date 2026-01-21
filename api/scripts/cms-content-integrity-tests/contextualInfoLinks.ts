import {
  allContextualInfoFileNames,
  conextualLinkRegexGlobal,
} from "@businessnjgovnavigator/api/scripts/cms-content-integrity-tests/contextualInfoLinksUtil";
import { getMergedConfig } from "@businessnjgovnavigator/shared/src/contexts";
import { getIndustries } from "@businessnjgovnavigator/shared/src/industry";
import {
  ConfigMatch,
  FileData,
  getAnytimeActionLicenseReinstatementsData,
  getAnytimeActionTasksData,
  getBusinessFormationData,
  getCertificationData,
  getFilingData,
  getFundingData,
  getIndustryData,
  getLicenseEventData,
  getNonEssentialQuestionData,
  getSidebarCardData,
  getStepData,
  getTaskData,
  getWebflowLicenseData,
  getXrayRenewalCalendarEventData,
  Match,
  searchConfig,
} from "@businessnjgovnavigator/shared/src/lib/search";
import {
  loadAllAnytimeActionLicenseReinstatements,
  loadAllAnytimeActionTasks,
  loadAllCertifications,
  loadAllEnvironmentTasks,
  loadAllFilings,
  loadAllFundings,
  loadAllLicenseCalendarEvents,
  loadAllLicenseTasks,
  loadAllMunicipalTasks,
  loadAllTasksOnly,
  loadAllWebflowLicenses,
  loadCmsConfig,
  loadDomesticStepsJsonPathTestJsonForTest,
  loadForeignStepsJsonPathTestJsonForTest,
  loadFormationDbaContent,
  loadNonEssentialQuestionsJsonForTest,
  loadRoadmapSideBarDisplayContent,
  loadStepsJsonPathTestJsonForTest,
  loadXrayRenewalCalendarEvent,
} from "@businessnjgovnavigator/shared/src/static";
import {
  NonEssentialQuestion,
  SidebarCardContent,
  TaskWithoutLinks,
} from "@businessnjgovnavigator/shared/src/types";
import { publishSnsMessage } from "@libs/awsSns";

export const findMatchingContextualInfo = (
  FileDataArray: FileData[],
  displayTitle: string,
): Match[] => {
  const matchArray: Match[] = [];

  for (const fileDataElement of FileDataArray) {
    const match: Match = {
      filename: fileDataElement.fileName,
      displayTitle: displayTitle,
      snippets: [],
    };

    const blockTexts = fileDataElement.blockTexts;
    for (const blockTextElement of blockTexts) {
      if (blockTextElement) {
        const matches = [...blockTextElement.matchAll(conextualLinkRegexGlobal)];
        const contextualInfoFileName = matches.map((match) => match[1]);
        if (contextualInfoFileName) {
          for (const contextualInfoName of contextualInfoFileName) {
            if (contextualInfoName && !allContextualInfoFileNames().has(contextualInfoName)) {
              match.snippets.push(contextualInfoName);
            }
          }
        }
      }
    }

    const labelledTexts = fileDataElement.labelledTexts;
    for (const labelledTextElement of labelledTexts) {
      if (labelledTextElement.content) {
        const matches = [...labelledTextElement.content.matchAll(conextualLinkRegexGlobal)];
        const contextualInfoFileNames = matches.map((match) => match[1]);
        for (const contextualInfoFileName of contextualInfoFileNames) {
          if (contextualInfoFileName && !allContextualInfoFileNames().has(contextualInfoFileName)) {
            match.snippets.push(contextualInfoFileName);
          }
        }
      }
    }

    const ListTextsTexts = fileDataElement.listTexts;
    for (const ListTextsTextElement of ListTextsTexts) {
      if (ListTextsTextElement.content) {
        for (const listTextElementContent of ListTextsTextElement.content) {
          const matches = [...listTextElementContent.matchAll(conextualLinkRegexGlobal)];
          const contextualInfoFileNames = matches.map((match) => match[1]);
          for (const contextualInfoFileName of contextualInfoFileNames) {
            if (
              contextualInfoFileName &&
              !allContextualInfoFileNames().has(contextualInfoFileName)
            ) {
              match.snippets.push(contextualInfoFileName);
            }
          }
        }
      }
    }

    if (match.snippets.length > 0) {
      matchArray.push(match);
    }
  }
  return matchArray;
};

export const checkContextualInfoLinksUsage = async (topicArn: string): Promise<boolean> => {
  console.log("\n Starting Check Contextual Info Links Usage");

  let anyErrors = false;

  const sidebarCards: SidebarCardContent[] = Object.values(
    loadRoadmapSideBarDisplayContent().sidebarDisplayContent,
  );
  const businessFormationInfo: TaskWithoutLinks[] = Object.values(
    loadFormationDbaContent().formationDbaContent,
  );

  const matches: Match[] = [
    ...findMatchingContextualInfo(
      getAnytimeActionLicenseReinstatementsData(loadAllAnytimeActionLicenseReinstatements()),
      "Anytime Action License Reinstatements",
    ),
    ...findMatchingContextualInfo(
      getBusinessFormationData(businessFormationInfo),
      "Business Formation",
    ),
    ...findMatchingContextualInfo(
      getIndustryData(getIndustries({ overrideShowDisabledIndustries: true })),
      "Industry",
    ),
    ...findMatchingContextualInfo(getFilingData(loadAllFilings()), "Filing"),
    ...findMatchingContextualInfo(getSidebarCardData(sidebarCards), "Sidebar Card"),
    ...findMatchingContextualInfo(
      getLicenseEventData(loadAllLicenseCalendarEvents()),
      "License Event",
    ),
    ...findMatchingContextualInfo(
      getXrayRenewalCalendarEventData(loadXrayRenewalCalendarEvent()),
      "Xray Renewal Calendar Event",
    ),
    ...findMatchingContextualInfo(
      getWebflowLicenseData(loadAllWebflowLicenses()),
      "Webflow License",
    ),
    ...findMatchingContextualInfo(
      getAnytimeActionTasksData(loadAllAnytimeActionTasks()),
      "Anytime Action Tasks",
    ),
    ...findMatchingContextualInfo(getTaskData(loadAllTasksOnly()), "Task"),
    ...findMatchingContextualInfo(getFundingData(loadAllFundings()), "Funding"),
    ...findMatchingContextualInfo(
      getNonEssentialQuestionData(loadNonEssentialQuestionsJsonForTest() as NonEssentialQuestion[]),
      "Non Essential Question",
    ),
    ...findMatchingContextualInfo(getStepData(loadStepsJsonPathTestJsonForTest()), "Step"),
    ...findMatchingContextualInfo(
      getStepData(loadDomesticStepsJsonPathTestJsonForTest()),
      "Domestic Step",
    ),
    ...findMatchingContextualInfo(
      getStepData(loadForeignStepsJsonPathTestJsonForTest()),
      "Foreign Step",
    ),
    ...findMatchingContextualInfo(getCertificationData(loadAllCertifications()), "Certification"),
    ...findMatchingContextualInfo(getTaskData(loadAllEnvironmentTasks()), "Task"),
    ...findMatchingContextualInfo(getTaskData(loadAllMunicipalTasks()), "Task"),
    ...findMatchingContextualInfo(getTaskData(loadAllLicenseTasks()), "Task"),
  ];

  if (matches.length > 0) {
    anyErrors = true;

    for (const match of matches) {
      const logMessage = `business-ux-content: In *"${match.displayTitle}"* under *"${match.filename}"*, the *"${match.snippets.join(", ")}"* contextual info links are broken and doesn't point to any existing content. Please replace. `;
      console.error(logMessage);
      await publishSnsMessage(logMessage, topicArn);
    }
  }

  const Config = getMergedConfig();

  const configMatches: ConfigMatch[] = [];
  try {
    const conextualInfoInstanceMatch = searchConfig(
      Config,
      { regex: conextualLinkRegexGlobal },
      loadCmsConfig(true),
    );

    for (const configMatch of conextualInfoInstanceMatch) {
      for (const innerMatch of configMatch.matches) {
        if (!allContextualInfoFileNames().has(innerMatch.value)) {
          configMatches.push(innerMatch);
        }
      }
    }

    if (configMatches.length > 0) {
      anyErrors = true;

      for (const configMatch of configMatches) {
        const logMessage = `business-ux-content: In the CMS config *"${configMatch.cmsLabelPath.join("/")}"* the contexual link *"${configMatch.value}"* is broken. Please replace it with a valid value`;
        console.error(logMessage);
        await publishSnsMessage(logMessage, topicArn);
      }
    }
  } catch (error) {
    console.log("e", error);
  }
  return anyErrors;
};
