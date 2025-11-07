// We should try not to do this; if you do need to disable typescript please include a comment justifying why.
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { loadYamlFiles } from "@/lib/static/admin/loadYamlFiles";

type AnyObject = { [key: string]: any };

function countKeyValuePair(
  data: AnyObject | AnyObject[],
  searchKey: string,
  searchValue: any,
): number {
  let count = 0;

  if (Array.isArray(data)) {
    for (const item of data) {
      count += countKeyValuePair(item, searchKey, searchValue);
    }
  } else if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      // Check if both key and value match the search criteria
      if (key === searchKey && value === searchValue) {
        count += 1;
      }

      // Recursively search if the value is another object or array
      if (typeof value === "object" && value !== null) {
        count += countKeyValuePair(value, searchKey, searchValue);
      }
    }
  }

  return count;
}

const composeErrorMessage = (
  numberOfExpectedOccurances: number,
  typeOfCollection: string,
): string => {
  return `We expected the ${typeOfCollection} collection to have ${numberOfExpectedOccurances} relational widgets. If this has failed it means you've added new instances of relational widget for ${typeOfCollection}. Please track them in the findDeadLinks.ts file and the taskIntegrityTests.ts files so we can make sure they it is known if they have unused content or are pointing to invalid content moving forward`;
};

const EXPECTED_NUMBER_OF_TASK_RELATIONS = 8;
const EXPECTED_NUMBER_OF_LICENSE_TASK_RELATIONS = 4;

describe("Make sure we Have the expected number of Tasks tracked by our tests", () => {
  const yamlContent = loadYamlFiles();

  it("Track number of Task collections", () => {
    const tasksCollection = "tasks";
    const taskRelations = countKeyValuePair(yamlContent, "collection", tasksCollection);
    expect(composeErrorMessage(taskRelations, tasksCollection)).toBe(
      composeErrorMessage(EXPECTED_NUMBER_OF_TASK_RELATIONS, tasksCollection),
    );
  });

  it("Track Number of Task Collections", () => {
    const licenseTaskCollection = "license-tasks";
    const licenseTaskRelations = countKeyValuePair(
      yamlContent,
      "collection",
      licenseTaskCollection,
    );
    expect(composeErrorMessage(licenseTaskRelations, licenseTaskCollection)).toBe(
      composeErrorMessage(EXPECTED_NUMBER_OF_LICENSE_TASK_RELATIONS, licenseTaskCollection),
    );
  });
});
