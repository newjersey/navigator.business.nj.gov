import { getIndustries } from "@businessnjgovnavigator/shared";
import { LogWriterType } from "@libs/logWriter";
import { loadAllAddOns, loadAllTasks, loadTaskDependenciesFile } from "@shared/static";

export const checkTaskUsage = async (
  topicArn: string,
  stage: string,
  logger: LogWriterType,
): Promise<void> => {
  try {
    console.log("in Check Task Usage");
    /**
     * We need to grab all tasks
     * We need to grab / record all places with relations that map to tasks'
     *
     * Probably should also do license-tasks
     */

    const allTasksFilenames = new Set(loadAllTasks().map((task) => task.filename));

    // settings -> task Dependencies -> task Dependenceis
    // settings -> task dependencies -> task
    await settingsTaskUsage(allTasksFilenames, topicArn, stage);
    await addOnTaskUsage(allTasksFilenames, topicArn, stage);
    await industriesTaskUsage(allTasksFilenames, topicArn, stage);
  } catch (error) {
    logger.LogError(`Error when running CMS integrity tests: ${error}`);
  }
};

const settingsTaskUsage = async (
  allTasksFilenames: Set<string>,
  topicArn: string,
  stage: string,
): Promise<void> => {
  console.log("settings task usage");
  const taskDependencies = loadTaskDependenciesFile(); // need to get a typing on this for ts to work well
  for (const dependency of taskDependencies.dependencies) {
  }
};

const industriesTaskUsage = async (
  allTasksFilenames: Set<string>,
  topicArn: string,
  stage: string,
): Promise<void> => {
  console.log("industries task usage");
  const industries = getIndustries();
  // roadmaps -> roadmap steps -> tasks
  // roadmaps -> task overrides -> replaceWithFilename
  // roadmaps -> tasks overrides -> taskToReplaceFilename
  for (const industry of industries) {
    for (const step of industry.roadmapSteps) {
      if (step.task && !allTasksFilenames.has(step.task)) {
        const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a roadmap task that no longer exists (*"${step.task}"*). Please replace this with a new task.`;
        console.log(logMessage);
      }
    }
    if (industry.modifications) {
      for (const modification of industry.modifications) {
        if (!allTasksFilenames.has(modification.replaceWithFilename)) {
          const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a modification replaceWithFilename task that no longer exists (*"${modification.replaceWithFilename}"*). Please replace this with a new task.`;
          console.log(logMessage);
          // await publishSnsMessage(logMessage, topicArn, stage);
        }
        if (!allTasksFilenames.has(modification.taskToReplaceFilename)) {
          const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a modification taskToReplaceFilename task that no longer exists (*"${modification.taskToReplaceFilename}"*). Please replace this with a new task.`;
          console.log(logMessage);
          // await publishSnsMessage(logMessage, topicArn, stage);
        }
      }
    }
  }
};

const addOnTaskUsage = async (
  allTasksFilenames: Set<string>,
  topicArn: string,
  stage: string,
): Promise<void> => {
  // addons -> task overrids -> replaceWithFilename
  // addons -> task overrides -> taskToReplaceFilename
  // addons -> roadmap steps -> task
  const allAddOns = loadAllAddOns();
  for (const addOn of allAddOns) {
    if (addOn.roadmapSteps) {
      for (const roadmapStep of addOn.roadmapSteps) {
        if (roadmapStep.task && !allTasksFilenames.has(roadmapStep.task)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Roadmap Step with a Task that no longer exists (*"${roadmapStep.task}"*). Please replace this with a new task.`;
          console.log(logMessage);
          // await publishSnsMessage(logMessage, topicArn, stage);
        }
      }
    }

    if (addOn.modifications) {
      for (const modification of addOn.modifications) {
        if (
          modification.replaceWithFilename &&
          !allTasksFilenames.has(modification.replaceWithFilename)
        ) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Task Override, Task To Replace that no longer exists (*"${modification.replaceWithFilename}"*). Please replace this with a new task.`;
          console.log(logMessage);
          // await publishSnsMessage(logMessage, topicArn, stage);
        }
        if (
          modification.taskToReplaceFilename &&
          !allTasksFilenames.has(modification.taskToReplaceFilename)
        ) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Task Override, Modified Task that no longer exists (*"${modification.taskToReplaceFilename}"*). Please replace this with a new task.`;
          console.log(logMessage);
          // await publishSnsMessage(logMessage, topicArn, stage);
        }
      }
    }
  }
};
