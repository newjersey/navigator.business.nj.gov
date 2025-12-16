import { IndustryRoadmap } from "../../types";
import { Match } from "./typesForSearch";
import {
  AddAddOnUsage,
  AddIndustryUsage,
  AddTaskDependencyUsage,
  composeAddOnLicenseTaskString,
  composeAddOnReplaceWithFileNameString,
  composeAddOnTaskString,
  composeAddOnTaskToReplaceFilenameString,
  composeHasLicenseTaskDependenciesString,
  composeHasTaskDependenciesString,
  composeIndstryLicenseTaskString,
  composeIndstryTaskString,
  composeIsLicenseTaskDependencyString,
  composeIsTaskDependencyTaskString,
} from "./usageHelpers";

jest.mock("../../../../content/src/roadmaps/task-dependencies.json", () => ({
  dependencies: [
    {
      task: "task-name",
      taskDependencies: [""],
    },
    {
      licenseTask: "license-task-name",
      taskDependencies: [""],
    },
    {
      task: "task-with-dependencies",
      taskDependencies: ["task-dependency"],
    },
    {
      licenseTask: "license-task-with-dependencies",
      licenseTaskDependencies: ["license-task-dependency"],
    },
  ],
}));

const createMatches = (filename: string): Match[] => {
  return [
    {
      filename: filename,
      displayTitle: "displayTitle",
      snippets: ["", ""],
      additionalUsageLocations: { taskDependencies: [], industries: [], addOns: [] },
    },
  ];
};

describe("usageHelpers", () => {
  describe("taskDependency", () => {
    it("task match", () => {
      const matches = createMatches("task-name");
      AddTaskDependencyUsage(matches);
      expect(matches[0].additionalUsageLocations?.taskDependencies?.[0]).toStrictEqual({
        description: composeHasTaskDependenciesString(),
        link: "/mgmt/cms#/collections/settings/entries/task-dependencies",
      });
    });

    it("license task match", () => {
      const matches = createMatches("license-task-name");
      AddTaskDependencyUsage(matches);
      expect(matches[0].additionalUsageLocations?.taskDependencies?.[0]).toStrictEqual({
        description: composeHasLicenseTaskDependenciesString(),
        link: "/mgmt/cms#/collections/settings/entries/task-dependencies",
      });
    });

    it("task dependency match", () => {
      const matches = createMatches("task-dependency");
      AddTaskDependencyUsage(matches);
      expect(matches[0].additionalUsageLocations?.taskDependencies?.[0]).toStrictEqual({
        description: composeIsTaskDependencyTaskString("task-with-dependencies"),
        link: "/mgmt/cms#/collections/settings/entries/task-dependencies",
      });
    });

    it("license task dependency match", () => {
      const matches = createMatches("license-task-dependency");
      AddTaskDependencyUsage(matches);
      expect(matches[0].additionalUsageLocations?.taskDependencies?.[0]).toStrictEqual({
        description: composeIsLicenseTaskDependencyString("license-task-with-dependencies"),
        link: "/mgmt/cms#/collections/settings/entries/task-dependencies",
      });
    });
  });

  describe("industry", () => {
    const industry = {
      id: "id",
      name: "name",
      description: "",
      canHavePermanentLocation: true,
      roadmapSteps: [
        {
          step: 1,
          weight: 1,
          task: "task-match",
          licenseTask: "",
          required: false,
        },
        {
          step: 1,
          weight: 1,
          task: "",
          licenseTask: "license-task-match",
          required: false,
        },
      ],
      nonEssentialQuestionsIds: [],
      naicsCodes: "",
      isEnabled: false,
      industryOnboardingQuestions: {
        isProvidesStaffingServicesApplicable: undefined,
        isCertifiedInteriorDesignerApplicable: undefined,
        isRealEstateAppraisalManagementApplicable: undefined,
        canBeHomeBased: undefined,
        isLiquorLicenseApplicable: undefined,
        isCpaRequiredApplicable: undefined,
        isTransportation: undefined,
        isCarServiceApplicable: undefined,
        isInterstateLogisticsApplicable: undefined,
        isInterstateMovingApplicable: undefined,
        isChildcareForSixOrMore: undefined,
        willSellPetCareItems: undefined,
        isPetCareHousingApplicable: undefined,
      },
    };

    it("industry task match", () => {
      const matches = createMatches("task-match");

      AddIndustryUsage(matches, [industry]);
      expect(matches[0].additionalUsageLocations?.industries?.[0]).toStrictEqual({
        description: composeIndstryTaskString("name"),
        link: "/mgmt/cms#/collections/roadmaps/entries/id",
      });
    });

    it("industry license task match", () => {
      const matches = createMatches("license-task-match");

      AddIndustryUsage(matches, [industry]);
      expect(matches[0].additionalUsageLocations?.industries?.[0]).toStrictEqual({
        description: composeIndstryLicenseTaskString("name"),
        link: "/mgmt/cms#/collections/roadmaps/entries/id",
      });
    });
  });

  describe("addOns", () => {
    const addOns: IndustryRoadmap[] = [
      {
        id: "id",
        roadmapSteps: [
          {
            step: 1,
            weight: 1,
            task: "task-match",
            licenseTask: "",
          },
          {
            step: 1,
            weight: 1,
            task: "",
            licenseTask: "license-task-match",
          },
        ],
        modifications: [
          { taskToReplaceFilename: "task-replace-match", replaceWithFilename: "" },
          { taskToReplaceFilename: "", replaceWithFilename: "replace-with-match" },
        ],
      },
    ];

    it("task-match", () => {
      const matches = createMatches("task-match");

      AddAddOnUsage(matches, addOns);
      expect(matches[0].additionalUsageLocations?.addOns?.[0]).toStrictEqual({
        description: composeAddOnTaskString("id"),
        link: "/mgmt/cms#/collections/addons/entries/id",
      });
    });

    it("license-task-match", () => {
      const matches = createMatches("license-task-match");

      AddAddOnUsage(matches, addOns);
      expect(matches[0].additionalUsageLocations?.addOns?.[0]).toStrictEqual({
        description: composeAddOnLicenseTaskString("id"),
        link: "/mgmt/cms#/collections/addons/entries/id",
      });
    });

    it("task-replace-match", () => {
      const matches = createMatches("task-replace-match");

      AddAddOnUsage(matches, addOns);
      expect(matches[0].additionalUsageLocations?.addOns?.[0]).toStrictEqual({
        description: composeAddOnTaskToReplaceFilenameString("id"),
        link: "/mgmt/cms#/collections/addons/entries/id",
      });
    });

    it("replace-with-match", () => {
      const matches = createMatches("replace-with-match");

      AddAddOnUsage(matches, addOns);
      expect(matches[0].additionalUsageLocations?.addOns?.[0]).toStrictEqual({
        description: composeAddOnReplaceWithFileNameString("id"),
        link: "/mgmt/cms#/collections/addons/entries/id",
      });
    });
  });
});
