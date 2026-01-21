import {
  getIndustryJson,
  loadAllAddOns,
  loadAllTasks,
} from "@businessnjgovnavigator/shared/src/static";
import { publishSnsMessage } from "@libs/awsSns";

export const checkTaskUsage = async (topicArn: string): Promise<boolean> => {
  console.log("\n Starting Check Task Usage");

  const allTasksFilenames = new Set(loadAllTasks().map((task) => task.filename));

  const addOnTaskUsageErrors = await addOnTaskUsage(allTasksFilenames, topicArn);
  const industriesTaskUsageErrors = await industriesTaskUsage(allTasksFilenames, topicArn);
  return addOnTaskUsageErrors || industriesTaskUsageErrors;
};

const industriesTaskUsage = async (
  allTasksFilenames: Set<string>,
  topicArn: string,
): Promise<boolean> => {
  let hasErrors = false;
  const industries = getIndustryJson();
  for (const industry of industries) {
    for (const step of industry.roadmapSteps) {
      if (step.task && !allTasksFilenames.has(step.task)) {
        const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a roadmap task that no longer exists (*"${step.task}"*). Please replace this with a new task.`;

        console.error(logMessage);
        hasErrors = true;
        await publishSnsMessage(logMessage, topicArn);
      }
      if (step.licenseTask && !allTasksFilenames.has(step.licenseTask)) {
        const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a roadmap license task that no longer exists (*"${step.licenseTask}"*). Please replace this with a new license task.`;

        console.error(logMessage);
        hasErrors = true;
        await publishSnsMessage(logMessage, topicArn);
      }
    }
    if (industry.modifications) {
      for (const modification of industry.modifications) {
        if (!allTasksFilenames.has(modification.replaceWithFilename)) {
          const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a modification replaceWithFilename task that no longer exists (*"${modification.replaceWithFilename}"*). Please replace this with a new task.`;

          console.error(logMessage);
          hasErrors = true;
          await publishSnsMessage(logMessage, topicArn);
        }
        if (!allTasksFilenames.has(modification.taskToReplaceFilename)) {
          const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a modification taskToReplaceFilename task that no longer exists (*"${modification.taskToReplaceFilename}"*). Please replace this with a new task.`;

          console.error(logMessage);
          hasErrors = true;
          await publishSnsMessage(logMessage, topicArn);
        }
      }
    }
  }
  return hasErrors;
};

const addOnTaskUsage = async (
  allTasksFilenames: Set<string>,
  topicArn: string,
): Promise<boolean> => {
  let hasErrors = false;
  const allAddOns = loadAllAddOns();
  for (const addOn of allAddOns) {
    if (addOn.roadmapSteps) {
      for (const roadmapStep of addOn.roadmapSteps) {
        if (roadmapStep.task && !allTasksFilenames.has(roadmapStep.task)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Roadmap Step with a Task that no longer exists (*"${roadmapStep.task}"*). Please replace this with a new task.`;

          console.error(logMessage);
          hasErrors = true;
          await publishSnsMessage(logMessage, topicArn);
        }
        if (roadmapStep.licenseTask && !allTasksFilenames.has(roadmapStep.licenseTask)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Roadmap Step with a License Task that no longer exists (*"${roadmapStep.licenseTask}"*). Please replace this with a new license task.`;

          console.error(logMessage);
          hasErrors = true;
          await publishSnsMessage(logMessage, topicArn);
        }
      }
    }

    if (addOn.modifications) {
      for (const modification of addOn.modifications) {
        if (!allTasksFilenames.has(modification.replaceWithFilename)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Task Override, Task To Replace that no longer exists (*"${modification.replaceWithFilename}"*). Please replace this with a new task.`;

          console.error(logMessage);
          hasErrors = true;
          await publishSnsMessage(logMessage, topicArn);
        }
        if (!allTasksFilenames.has(modification.taskToReplaceFilename)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Task Override, Modified Task that no longer exists (*"${modification.taskToReplaceFilename}"*). Please replace this with a new task.`;

          console.error(logMessage);
          hasErrors = true;
          await publishSnsMessage(logMessage, topicArn);
        }
      }
    }
  }
  return hasErrors;
};
