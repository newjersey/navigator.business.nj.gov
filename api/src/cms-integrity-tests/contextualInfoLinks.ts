import { getIndustries } from "@businessnjgovnavigator/shared";
import { LogWriterType } from "@libs/logWriter";
import { FileData, getAnytimeActionLicenseReinstatementsData, Match } from "@shared/lib/search";
import {
  loadAllAddOns,
  loadAllAnytimeActionLicenseReinstatements,
  loadAllContextualInfo,
  loadFormationDbaContent,
  loadRoadmapSideBarDisplayContent,
} from "@shared/static";
import { SidebarCardContent, TaskWithoutLinks } from "@shared/types";

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

      if (match.snippets.length > 0) {
        matchArray.push(match);
      }
    }
    return matchArray;
  };

  try {
    console.log("in contextual info link search ");

    const industries = getIndustries();
    const addOns = loadAllAddOns();
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
    ];

    // works new

    //works

    // searchBusinessFormation(findMatchingContextualInfo, businessFormationInfo, unusedTerm),
    // searchIndustries(
    //   findMatchingContextualInfo,
    //   getIndustries({ overrideShowDisabledIndustries: true }),
    //   unusedTerm,
    // ),
    // searchTaxFilings(findMatchingContextualInfo, loadAllFilings(), unusedTerm), // this has borken and fixed content assocaitd with it's BRC in this commit
    // searchSidebarCards(findMatchingContextualInfo, sidebarCards, unusedTerm),
    // searchLicenseEvents(findMatchingContextualInfo, loadAllLicenseCalendarEvents(), unusedTerm),
    // searchXrayRenewalCalendarEvent(
    //   findMatchingContextualInfo,
    //   loadXrayRenewalCalendarEvent(),
    //   unusedTerm,
    // ),
    // searchWebflowLicenses(findMatchingContextualInfo, loadAllWebflowLicenses(), unusedTerm),

    // searchAnytimeActionTasks(findMatchingContextualInfo, loadAllAnytimeActionTasks(), unusedTerm),
    // some ISSUES with searchAnytimeActionTasks
    // electrical-contracting-business-permit-update (is this used? The certification of formation part is invlaid and I can't exactly figure out how to trigger easily)
    // trucking-ifta-aa, borken federal tax ID contextual info link.

    // searchTasks(findMatchingContextualInfo, loadAllTasksOnly(), unusedTerm, industries, addOns),
    //ISSUES WITH trucking-ifta, specifically federal-tax-id is broken

    // searchTasks(
    //   findMatchingContextualInfo,
    //   loadAllLicenseTasks(),
    //   unusedTerm,
    //   industries,
    //   addOns,
    // ),
    // Issues with insurance-producer in individual-producer-license and new-producer-license

    // searchTasks(
    //   findMatchingContextualInfo,
    //   loadAllMunicipalTasks(),
    //   unusedTerm,
    //   industries,
    //   addOns,
    // ),

    // searchTasks(
    //   findMatchingContextualInfo,
    //   loadAllEnvironmentTasks(),
    //   unusedTerm,
    //   industries,
    //   addOns,
    // ),
    // searchCertifications(findMatchingContextualInfo, loadAllCertifications(), unusedTerm),
    // searchCertifications(findMatchingContextualInfo, loadAllArchivedCertifications(), unusedTerm),
    // searchFundings(findMatchingContextualInfo, loadAllFundings(), unusedTerm),
    // Issues with njbac-cannabis-training-academy, but this may be unused?

    // searchNonEssentialQuestions(
    //   findMatchingContextualInfo,
    //   loadNonEssentialQuestionsJsonForTest() as NonEssentialQuestion[],
    //   unusedTerm,
    // ),

    // `lable for content|name-of-file`

    // searchSteps(loadStepsJsonPathTestJsonForTest(), unusedTerm, {
    //   filename: "steps",
    //   displayTitle: "Steps",
    // }),
    // searchSteps(loadDomesticStepsJsonPathTestJsonForTest(), unusedTerm, {
    //   filename: "steps-domestic-employer",
    //   displayTitle: "Steps - Domestic Employer",
    // }),
    // searchSteps(loadForeignStepsJsonPathTestJsonForTest(), unusedTerm, {
    //   filename: "steps-foreign",
    //   displayTitle: "Steps - Dakota",
    // }),

    // const Config = getMergedConfig();
    // // console.log("Config:", JSON.stringify(Config));

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
