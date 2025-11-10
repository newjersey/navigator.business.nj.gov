import { publishSnsMessage } from "@libs/awsSns";
import { LogWriterType } from "@libs/logWriter";
import { getIndustryJsonForTest, loadAllAddOns, loadAllTasks } from "@shared/static";

export const checkTaskUsage = async (
  topicArn: string,
  stage: string,
  logger: LogWriterType,
): Promise<void> => {
  try {
    const allTasksFilenames = new Set(loadAllTasks(true).map((task) => task.filename));

    await addOnTaskUsage(allTasksFilenames, topicArn, stage);
    await industriesTaskUsage(allTasksFilenames, topicArn, stage);
  } catch (error) {
    logger.LogError(`Error when running CMS integrity tests: ${error}`);
  }
};

const industriesTaskUsage = async (
  allTasksFilenames: Set<string>,
  topicArn: string,
  stage: string,
): Promise<void> => {
  const industries = getIndustryJsonForTest();
  for (const industry of industries) {
    for (const step of industry.roadmapSteps) {
      if (step.task && !allTasksFilenames.has(step.task)) {
        const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a roadmap task that no longer exists (*"${step.task}"*). Please replace this with a new task.`;

        await publishSnsMessage(logMessage, topicArn, stage);
      }
      if (step.licenseTask && !allTasksFilenames.has(step.licenseTask)) {
        const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a roadmap license task that no longer exists (*"${step.licenseTask}"*). Please replace this with a new license task.`;

        await publishSnsMessage(logMessage, topicArn, stage);
      }
    }
    if (industry.modifications) {
      for (const modification of industry.modifications) {
        if (!allTasksFilenames.has(modification.replaceWithFilename)) {
          const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a modification replaceWithFilename task that no longer exists (*"${modification.replaceWithFilename}"*). Please replace this with a new task.`;

          await publishSnsMessage(logMessage, topicArn, stage);
        }
        if (!allTasksFilenames.has(modification.taskToReplaceFilename)) {
          const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a modification taskToReplaceFilename task that no longer exists (*"${modification.taskToReplaceFilename}"*). Please replace this with a new task.`;

          await publishSnsMessage(logMessage, topicArn, stage);
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
  const allAddOns = loadAllAddOns(true);
  for (const addOn of allAddOns) {
    if (addOn.roadmapSteps) {
      for (const roadmapStep of addOn.roadmapSteps) {
        if (roadmapStep.task && !allTasksFilenames.has(roadmapStep.task)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Roadmap Step with a Task that no longer exists (*"${roadmapStep.task}"*). Please replace this with a new task.`;

          await publishSnsMessage(logMessage, topicArn, stage);
        }
        if (roadmapStep.licenseTask && !allTasksFilenames.has(roadmapStep.licenseTask)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Roadmap Step with a License Task that no longer exists (*"${roadmapStep.licenseTask}"*). Please replace this with a new license task.`;

          await publishSnsMessage(logMessage, topicArn, stage);
        }
      }
    }

    if (addOn.modifications) {
      for (const modification of addOn.modifications) {
        if (!allTasksFilenames.has(modification.replaceWithFilename)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Task Override, Task To Replace that no longer exists (*"${modification.replaceWithFilename}"*). Please replace this with a new task.`;

          await publishSnsMessage(logMessage, topicArn, stage);
        }
        if (!allTasksFilenames.has(modification.taskToReplaceFilename)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Task Override, Modified Task that no longer exists (*"${modification.taskToReplaceFilename}"*). Please replace this with a new task.`;

          await publishSnsMessage(logMessage, topicArn, stage);
        }
      }
    }
  }
};
