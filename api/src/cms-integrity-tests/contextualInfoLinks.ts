import { getIndustries } from "@businessnjgovnavigator/shared";
import { LogWriterType } from "@libs/logWriter";
import {
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
} from "@shared/lib/search";
import {
  loadAllAnytimeActionLicenseReinstatements,
  loadAllAnytimeActionTasks,
  loadAllCertifications,
  loadAllContextualInfo,
  loadAllEnvironmentTasks,
  loadAllFilings,
  loadAllFundings,
  loadAllLicenseCalendarEvents,
  loadAllLicenseTasks,
  loadAllMunicipalTasks,
  loadAllTasksOnly,
  loadAllWebflowLicenses,
  loadDomesticStepsJsonPathTestJsonForTest,
  loadForeignStepsJsonPathTestJsonForTest,
  loadFormationDbaContent,
  loadNonEssentialQuestionsJsonForTest,
  loadRoadmapSideBarDisplayContent,
  loadStepsJsonPathTestJsonForTest,
  loadXrayRenewalCalendarEvent,
} from "@shared/static";
import { NonEssentialQuestion, SidebarCardContent, TaskWithoutLinks } from "@shared/types";

export const checkContextualInfoLinksUsage = async (
  topicArn: string,
  stage: string,
  logger: LogWriterType,
): Promise<void> => {
  console.log("IN THE THINGS WAAAAA");

  const regexGlobal = /[^`|]*`[^|]+\|([^`]+)`/g;
  const allContextualInfoFileNames = new Set(
    loadAllContextualInfo().map((element) => element.filename.toLowerCase()),
  );

  // NEXT WE TEST THIS TO SEE IF IT PRINTS OUR SNIPITS AS HAVING ALL THE UNUSED CONTEXTUAL INFO INSIDE IT.
  // WHICH MAY BE NONE, MUST MODIFY THAT FIRST POTENTIALLY
  // ALSO need to format log messages better before printing
  // also need to move this call into API so I can run it from the backend an have it actually do seomthign

  const findMatchingContextualInfo = (FileDataArray: FileData[]): Match[] => {
    const matchArray: Match[] = [];

    for (const fileDataElement of FileDataArray) {
      const match: Match = {
        filename: fileDataElement.fileName,
        snippets: [],
      };

      const blockTexts = fileDataElement.blockTexts;
      for (const blockTextElement of blockTexts) {
        if (blockTextElement) {
          const matches = [...blockTextElement.matchAll(regexGlobal)];
          const contextualInfoFileName = matches.map((match) => match[1]);
          if (contextualInfoFileName) {
            for (const contextualInfoName of contextualInfoFileName) {
              if (contextualInfoName && !allContextualInfoFileNames.has(contextualInfoName)) {
                match.snippets.push(contextualInfoName);
              }
            }
          }
        }
      }

      const labelledTexts = fileDataElement.labelledTexts;
      for (const labelledTextElement of labelledTexts) {
        if (labelledTextElement.content) {
          const matches = [...labelledTextElement.content.matchAll(regexGlobal)];
          const contextualInfoFileNames = matches.map((match) => match[1]);
          for (const contextualInfoFileName of contextualInfoFileNames) {
            if (contextualInfoFileName && !allContextualInfoFileNames.has(contextualInfoFileName)) {
              match.snippets.push(contextualInfoFileName);
            }
          }
        }
      }

      const ListTextsTexts = fileDataElement.listTexts;
      for (const ListTextsTextElement of ListTextsTexts) {
        if (ListTextsTextElement.content) {
          for (const listTextElementContent of ListTextsTextElement.content) {
            const matches = [...listTextElementContent.matchAll(regexGlobal)];
            const contextualInfoFileNames = matches.map((match) => match[1]);
            for (const contextualInfoFileName of contextualInfoFileNames) {
              if (
                contextualInfoFileName &&
                !allContextualInfoFileNames.has(contextualInfoFileName)
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

  try {
    console.log("in contextual info link search ");
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
      ...findMatchingContextualInfo(getTaskData(loadAllLicenseTasks())), // file was renamed, make sure that doesn't screw up webflow sync. ask in PR comments
    ];

    // const Config = getMergedConfig();

    // const configMatches: ConfigMatch[] = [];

    // const conextualInfoInstanceMatch = searchConfig(Config, regexGlobal, loadCmsConfig(true)); // this one needs to be done seperately
    // for (const configMatch of conextualInfoInstanceMatch) {
    //   for (const innerMatch of configMatch.matches) {
    //     if (!allContextualInfoFileNames.has(innerMatch.value)) {
    //       configMatches.push(innerMatch);
    //     }
    //   }
    // }

    // console.log("configMatches:", JSON.stringify(configMatches));
    console.log("matches:", JSON.stringify(matches));
  } catch (error) {
    logger.LogError(`Error when running CMS integrity tests: ${error}`);
    console.log("error in CMS search", error);
  }
};
