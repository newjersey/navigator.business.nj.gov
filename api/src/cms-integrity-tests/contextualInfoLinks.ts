import { getIndustries } from "@businessnjgovnavigator/shared";
import { LogWriterType } from "@libs/logWriter";
import { LabelledContent, Match, searchTasks } from "@shared/lib/search";
import {
  loadAllAddOns,
  loadAllContextualInfo,
  loadAllTasksOnly,
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

  // NEXT WE TEST THIS TO SEE IF IT PRINTS OUR SNIPITS AS HAVING ALL THE UNUSED CONTEXTUAL INFO INSIDE IT.
  // WHICH MAY BE NONE, MUST MODIFY THAT FIRST POTENTIALLY
  // ALSO need to format log messages better before printing
  // also need to move this call into API so I can run it from the backend an have it actually do seomthign

  const findMatchingContextualInfo = (
    textToSearch: (string | undefined | LabelledContent)[],
    term: string,
    match: Match,
  ): Match => {
    const allContextualInfoFileNames = new Set(
      loadAllContextualInfo().map((element) => element.filename.toLowerCase()),
    );

    const regexGlobal = /[^`|]*`[^|]+\|([^`]+)`/g;

    const firstElement = textToSearch.find((item) => item !== undefined);

    if (firstElement === undefined) {
      return match;
    }
    if (typeof firstElement === "string") {
      for (const blockText of textToSearch as string[]) {
        if (blockText) {
          const matches = [...blockText.matchAll(regexGlobal)];
          const contextualInfoFileName = matches.map((match) => match[1]);
          // console.log("tope matches", contextualInfoFileName);
          if (contextualInfoFileName) {
            for (const contextualInfoName of contextualInfoFileName) {
              if (contextualInfoName && !allContextualInfoFileNames.has(contextualInfoName)) {
                match.snippets.push(contextualInfoName);
              }
            }
          }
        }
      }
    } else if (
      typeof firstElement === "object" &&
      "label" in firstElement &&
      "content" in firstElement
    ) {
      for (const labelledText of textToSearch as LabelledContent[]) {
        if (labelledText.content) {
          const matches = [...labelledText.content.matchAll(regexGlobal)];
          const contextualInfoFileNames = matches.map((match) => match[1]);
          // console.log("bottom matches", contextualInfoFileNames);
          for (const contextualInfoFileName of contextualInfoFileNames) {
            if (contextualInfoFileName && !allContextualInfoFileNames.has(contextualInfoFileName)) {
              console.log("in push", contextualInfoFileName);
              match.snippets.push(contextualInfoFileName);
            }
          }
        }
      }
    }
    return match;
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

    const matches: Match[][] = [];

    const unusedTerm = "&&&&&&&&&&";

    matches.push(
      //works
      // searchAnytimeActionLicenseReinstatements(
      //   findMatchingContextualInfo,
      //   loadAllAnytimeActionLicenseReinstatements(),
      //   unusedTerm,
      // ),
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

      // doesn't or idk

      searchTasks(findMatchingContextualInfo, loadAllTasksOnly(), unusedTerm, industries, addOns),
      //ISSUES WITH trucking-ifta, specifically federal-tax-id is broken

      // searchTasks(
      //   findMatchingContextualInfo,
      //   loadAllLicenseTasks(),
      //   unusedTerm,
      //   industries,
      //   addOns,
      // ),
      // searchTasks(
      //   findMatchingContextualInfo,
      //   loadAllMunicipalTasks(),
      //   unusedTerm,
      //   industries,
      //   addOns,
      // ),
      // searchTasks(
      //   findMatchingContextualInfo,
      //   loadAllRaffleBingoSteps(),
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

      // // searchCertifications(findMatchingContextualInfo, loadAllCertifications(), unusedTerm), // deal with this last
      // // searchCertifications(findMatchingContextualInfo, loadAllArchivedCertifications(), unusedTerm), // nope nope nope, not now
      // // searchFundings(findMatchingContextualInfo, loadAllFundings(), unusedTerm), // also a pain

      // These are unfinished tbh
      // searchSteps(Steps.steps as Step[], unusedTerm, {
      //   filename: "steps",
      //   displayTitle: "Steps",
      // }),
      // searchSteps(DomesticEmployerSteps.steps as Step[], unusedTerm, {
      //   filename: "steps-domestic-employer",
      //   displayTitle: "Steps - Domestic Employer",
      // }),
      // searchSteps(ForeignSteps.steps as Step[], unusedTerm, {
      //   filename: "steps-foreign",
      //   displayTitle: "Steps - Dakota",
      // }),
      // searchNonEssentialQuestions(
      //   NonEssentialQuestions.nonEssentialQuestionsArray as NonEssentialQuestion[],
      //   unusedTerm,
      // ),
      // searchConfig(Config, unusedTerm, loadCmsConfig()),
    );
    console.log("matches:", JSON.stringify(matches));
  } catch (error) {
    logger.LogError(`Error when running CMS integrity tests: ${error}`);
    console.log("error in CMS search", error);
  }
};
