import {
  allContextualInfoFileNames,
  conextualLinkRegexGlobal,
} from "@businessnjgovnavigator/api/src/cms-integrity-tests/contextualInfoLinksUtil";
import { LogWriterType } from "@libs/logWriter";
import { getMergedConfig } from "@shared/contexts";
import { getIndustries } from "@shared/industry";
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
} from "@shared/lib/search";
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
} from "@shared/static";
import { NonEssentialQuestion, SidebarCardContent, TaskWithoutLinks } from "@shared/types";

export const findMatchingContextualInfo = (FileDataArray: FileData[]): Match[] => {
  const matchArray: Match[] = [];

  for (const fileDataElement of FileDataArray) {
    const match: Match = {
      filename: fileDataElement.fileName,
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

export const checkContextualInfoLinksUsage = async (
  topicArn: string,
  stage: string,
  logger: LogWriterType,
): Promise<void> => {
  try {
    const sidebarCards: SidebarCardContent[] = Object.values(
      loadRoadmapSideBarDisplayContent().sidebarDisplayContent,
    );
    const businessFormationInfo: TaskWithoutLinks[] = Object.values(
      loadFormationDbaContent().formationDbaContent,
    );

    const matches: Match[] = [
      ...findMatchingContextualInfo(
        getAnytimeActionLicenseReinstatementsData(loadAllAnytimeActionLicenseReinstatements()),
      ),
      ...findMatchingContextualInfo(getBusinessFormationData(businessFormationInfo)),
      ...findMatchingContextualInfo(
        getIndustryData(getIndustries({ overrideShowDisabledIndustries: true })),
      ),
      ...findMatchingContextualInfo(getFilingData(loadAllFilings())),
      ...findMatchingContextualInfo(getSidebarCardData(sidebarCards)),
      ...findMatchingContextualInfo(getLicenseEventData(loadAllLicenseCalendarEvents())),
      ...findMatchingContextualInfo(
        getXrayRenewalCalendarEventData(loadXrayRenewalCalendarEvent()),
      ),
      ...findMatchingContextualInfo(getWebflowLicenseData(loadAllWebflowLicenses())),
      ...findMatchingContextualInfo(getAnytimeActionTasksData(loadAllAnytimeActionTasks())),
      ...findMatchingContextualInfo(getTaskData(loadAllTasksOnly())),
      ...findMatchingContextualInfo(getFundingData(loadAllFundings())),
      ...findMatchingContextualInfo(
        getNonEssentialQuestionData(
          loadNonEssentialQuestionsJsonForTest() as NonEssentialQuestion[],
        ),
      ),
      ...findMatchingContextualInfo(getStepData(loadStepsJsonPathTestJsonForTest())),
      ...findMatchingContextualInfo(getStepData(loadDomesticStepsJsonPathTestJsonForTest())),
      ...findMatchingContextualInfo(getStepData(loadForeignStepsJsonPathTestJsonForTest())),
      ...findMatchingContextualInfo(getCertificationData(loadAllCertifications())),
      ...findMatchingContextualInfo(getTaskData(loadAllEnvironmentTasks())),
      ...findMatchingContextualInfo(getTaskData(loadAllMunicipalTasks())),
      ...findMatchingContextualInfo(getTaskData(loadAllLicenseTasks())),
    ];

    console.log("matches:", JSON.stringify(matches)); // to be expanded on with move to GHA, left here intentionally for now

    const Config = getMergedConfig();

    const configMatches: ConfigMatch[] = [];

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
    console.log("configMatches:", JSON.stringify(configMatches)); // to be expanded on with move to GHA, left here intentionally for now
  } catch (error) {
    logger.LogError(`Error when running CMS integrity tests: ${error}`);
  }
};
