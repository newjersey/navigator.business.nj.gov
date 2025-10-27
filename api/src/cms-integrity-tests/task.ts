import { getIndustries } from "@businessnjgovnavigator/shared";
import { LogWriterType } from "@libs/logWriter";
import { loadAllAddOns, loadAllTasks, loadTaskDependenciesFile } from "@shared/static";
import { TaskDependencies } from "@shared/types/types";

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

    // NEXT TODO -> maybe we can pass a set in here and then add to that set continuously and then when we're at the look for unused things relative to that

    const allUsedTasks = new Set<string>();

    const allTasksFilenames = new Set(loadAllTasks().map((task) => task.filename));

    await addOnTaskUsage(allTasksFilenames, topicArn, stage, allUsedTasks);
    await industriesTaskUsage(allTasksFilenames, topicArn, stage, allUsedTasks);
    await settingsTaskUsage(allUsedTasks);

    const showPotentiallyUnusedTasks = false;
    // so with this inparticular, I'm thinking taht we maybe want this to be a part of the, deadlink url check workflow instead
    // the reason being there are kind of a lot of acceptions here, on top of the idea that content might want to create tasks pre-emptively before dev work is ready so this may be intentional leading to a bunch of unecssary alerts
    if (showPotentiallyUnusedTasks) {
      for (const taskFilename of allTasksFilenames) {
        if (!allUsedTasks.has(taskFilename)) {
          const logMessage = `business-ux-content: The *"${taskFilename}"* Task isn't used anywhere. Please delete this task`;
          console.log(logMessage);
        }
      }
    }
  } catch (error) {
    logger.LogError(`Error when running CMS integrity tests: ${error}`);
  }
};

// // This seems like it's unecessary because you will get other errors sooner when trying to load tasks at all and everything explodes.
const settingsTaskUsage = async (usedTasks: Set<string>): Promise<void> => {
  // settings -> task Dependencies -> task Dependenceis
  // settings -> task dependencies -> task
  console.log("settings task usage");
  const taskDependencies = loadTaskDependenciesFile().dependencies as unknown as TaskDependencies[];
  for (const dependency of taskDependencies) {
    if (dependency.task) {
      usedTasks.add(dependency.task);
    }
    if (dependency.licenseTask) {
      usedTasks.add(dependency.licenseTask);
    }
    if (dependency.taskDependencies) {
      for (const taskDependency of dependency.taskDependencies) {
        usedTasks.add(taskDependency);
      }
    }
    if (dependency.licenseTaskDependencies) {
      for (const licenseTaskDependency of dependency.licenseTaskDependencies) {
        usedTasks.add(licenseTaskDependency);
      }
    }
  }
};

const industriesTaskUsage = async (
  allTasksFilenames: Set<string>,
  topicArn: string,
  stage: string,
  usedTasks: Set<string>,
): Promise<void> => {
  console.log("industries task usage");
  const industries = getIndustries();
  // roadmaps -> roadmap steps -> tasks
  // roadmaps -> task overrides -> replaceWithFilename
  // roadmaps -> tasks overrides -> taskToReplaceFilename
  for (const industry of industries) {
    for (const step of industry.roadmapSteps) {
      if (step.task) {
        usedTasks.add(step.task);
        if (!allTasksFilenames.has(step.task)) {
          const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a roadmap task that no longer exists (*"${step.task}"*). Please replace this with a new task.`;
          console.log(logMessage);
          // await publishSnsMessage(logMessage, topicArn, stage);
        }
      }
      if (step.licenseTask) {
        usedTasks.add(step.licenseTask);
        if (!allTasksFilenames.has(step.licenseTask)) {
          const logMessage = `business-ux-content: The *"${industry.name}"* Industry has a roadmap license task that no longer exists (*"${step.licenseTask}"*). Please replace this with a new license task.`;
          console.log(logMessage);
          // await publishSnsMessage(logMessage, topicArn, stage);
        }
      }
    }
    if (industry.modifications) {
      for (const modification of industry.modifications) {
        usedTasks.add(modification.replaceWithFilename);
        usedTasks.add(modification.taskToReplaceFilename);
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
  usedTasks: Set<string>,
): Promise<void> => {
  // addons -> task overrids -> replaceWithFilename
  // addons -> task overrides -> taskToReplaceFilename
  // addons -> roadmap steps -> task
  const allAddOns = loadAllAddOns();
  for (const addOn of allAddOns) {
    if (addOn.roadmapSteps) {
      for (const roadmapStep of addOn.roadmapSteps) {
        if (roadmapStep.task) {
          usedTasks.add(roadmapStep.task);
          if (!allTasksFilenames.has(roadmapStep.task)) {
            const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Roadmap Step with a Task that no longer exists (*"${roadmapStep.task}"*). Please replace this with a new task.`;
            console.log(logMessage);
            // await publishSnsMessage(logMessage, topicArn, stage);
          }
        }
        if (roadmapStep.licenseTask) {
          usedTasks.add(roadmapStep.licenseTask);
          if (!allTasksFilenames.has(roadmapStep.licenseTask)) {
            const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Roadmap Step with a License Task that no longer exists (*"${roadmapStep.licenseTask}"*). Please replace this with a new license task.`;
            console.log(logMessage);
            // await publishSnsMessage(logMessage, topicArn, stage);
          }
        }
      }
    }

    if (addOn.modifications) {
      for (const modification of addOn.modifications) {
        usedTasks.add(modification.replaceWithFilename);
        usedTasks.add(modification.taskToReplaceFilename);
        if (!allTasksFilenames.has(modification.replaceWithFilename)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Task Override, Task To Replace that no longer exists (*"${modification.replaceWithFilename}"*). Please replace this with a new task.`;
          console.log(logMessage);
          // await publishSnsMessage(logMessage, topicArn, stage);
        }
        if (!allTasksFilenames.has(modification.taskToReplaceFilename)) {
          const logMessage = `business-ux-content: The *"${addOn.id}"* Add On has a Task Override, Modified Task that no longer exists (*"${modification.taskToReplaceFilename}"*). Please replace this with a new task.`;
          console.log(logMessage);
          // await publishSnsMessage(logMessage, topicArn, stage);
        }
      }
    }
  }
};
