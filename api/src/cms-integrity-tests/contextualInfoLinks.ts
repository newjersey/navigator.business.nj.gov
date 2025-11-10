import { LogWriterType } from "@libs/logWriter";
import { loadAllContextualInfo, loadFormationDbaContent } from "@shared/static";
// import { loadAllContextualInfo } from "@shared/static";
// import { ContextualInfoFile } from "@shared/types/types";

export const checkContextualInfoLinksUsage = async (
  topicArn: string,
  stage: string,
  logger: LogWriterType,
): Promise<void> => {
  const searchForContextualInfoAndSendMessage = async (
    stringToSearch: string,
    areaOfContextualInfo: string,
    knownContextualInfoFilenames: Set<string>,
  ): Promise<void> => {
    const regex = /^[^|]+\|([^`]+)/;

    const contextualInfoNameFromSearchString = stringToSearch.match(regex);

    if (
      contextualInfoNameFromSearchString &&
      contextualInfoNameFromSearchString[1] &&
      !knownContextualInfoFilenames.has(contextualInfoNameFromSearchString[1])
    ) {
      await publishLogMessage(areaOfContextualInfo, contextualInfoNameFromSearchString[1]);
    }
  };

  const publishLogMessage = async (
    areaOfMissingContextualInfo: string,
    contextualInfoThatDoesntExist: string,
  ): Promise<void> => {
    const logMessage = `The ${areaOfMissingContextualInfo} has a contextual info string (${contextualInfoThatDoesntExist}) that doesn't exist. Please replace it with one that does`;
    console.log(logMessage);

    // await publishSnsMessage(logMessage, topicArn, stage);
  };

  try {
    // const contextualInfoFiles: ContextualInfoFile[] = loadAllContextualInfo();
    // const contextualInfoIds = contextualInfoFiles.map((element) => element.filename);
    // we're going to need a regex that loks for `*|*` and then grabs the second * worth of stuff
    // we're also going to need to go through a lot of file and folders here to make sure this is sound and working as expected tbh
    /**
     * MD files
     * anytime-action-license-reinstatements,
     * anytime-action-tasks
     * certifications
     * business-formation/nexus
     * contextual-information
     *
     * filings
     * fundings
     * license-calendar-events
     * roadmaps
     * license-tasks
     * tasks
     *
     * JSON files
     * fieldConfig
     */
    // so inherently this is a bit awkward as really what we want to do is grab either, anywhere the <Content/> block is used in the application or parallely grab anywhere the markdown widget is used.
    // The question being is there a good way to do that?
    // Unfortunately I don't really see one. Which means we could / wold posisbly look at all the area's where the markdown widget is currently used and create that as our list of things to grab in this context.
    // However this doesn't really solve the issue where we want people who add markdown content in the future to add to this file so that the new content continues to be added to the integrity tests.
    // How could I do that????
    // So the idea would be to have a unit test where we read the config.yml as a file then we parse it in a way that grabs all the markdown fields and we have a list of all the ones we track here and export and we cross reference and die if we didn't do that right kind of thing
    // probably should actually have something similar for the cms search tool with regards to colleciton and how they are tracked

    console.log("in contextual info link search");

    const allContextualInfoFileNames = new Set(
      loadAllContextualInfo().map((element) => element.filename),
    );

    const dbaTasks = loadFormationDbaContent();
    dbaTasks.formationDbaContent.Authorize.contentMd;
    dbaTasks.formationDbaContent.Authorize.summaryDescriptionMd;
    dbaTasks.formationDbaContent.DbaResolution.contentMd;
    dbaTasks.formationDbaContent.DbaResolution.summaryDescriptionMd;
    dbaTasks.formationDbaContent.Formation.summaryDescriptionMd;
    dbaTasks.formationDbaContent.Formation.contentMd;
    // next TODO is to test this
    searchForContextualInfoAndSendMessage(
      dbaTasks.formationDbaContent.Authorize.contentMd,
      "DBA tasks, authroize",
      allContextualInfoFileNames,
    );

    // TODO thinking with the end in mind, with regards to tests that make sure we get devs know when they have not added to this file when they should have
    // what I think we might be able to do, is give a giant object key full of paths, and messages. Then the parsing of the yml file would be to make sure that see that something has markdown, see that it has an overarching category (file location), then the goal would be to cross reference with that exported array with regards to
    // whether or not that path is explored in the array or not
    // also puts a low burden on others as, they just have to add to the object's name or name plus file location

    /**
     * {
     *  fileLocation: "taskFolderPath",
     *  mdFields: ["summaryMd", "contentMd"]
     * }
     */

    // maybe this is overkill, only in the sense that I'm re-inveting the wheel and perhaps this is already done in the search tool. 100% should look there first
  } catch (error) {
    logger.LogError(`Error when running CMS integrity tests: ${error}`);
  }
};
