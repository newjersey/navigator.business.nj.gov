import { LogWriterType } from "@libs/logWriter";
// import { loadAllContextualInfo } from "@shared/static";
// import { ContextualInfoFile } from "@shared/types/types";

export const contextualInfoLinksUsage = async (
  topicArn: string,
  stage: string,
  logger: LogWriterType,
): Promise<void> => {
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
  } catch (error) {
    logger.LogError(`Error when running CMS integrity tests: ${error}`);
  }
};
