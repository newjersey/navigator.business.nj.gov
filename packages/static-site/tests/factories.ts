import type {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
  Industry,
} from "@/domain/content/types";

// biome-ignore lint/style/noProcessEnv: test factories read seed from environment for reproducibility
const seed = Number(process.env.TEST_SEED) || Math.floor(Math.random() * 2 ** 32);

let state = seed;
export const randomInt = (length = 8): number => {
  state = (state * 1664525 + 1013904223) >>> 0;
  return Math.floor((state / 2 ** 32) * (10 ** length - 10 ** (length - 1)) + 10 ** (length - 1));
};

export const generateIndustry = (overrides: Partial<Industry> = {}): Industry => {
  return {
    id: `industry-${randomInt()}`,
    name: `Test Industry ${randomInt()}`,
    canHavePermanentLocation: true,
    roadmapSteps: [],
    isEnabled: true,
    ...overrides,
  };
};

export const generateAnytimeActionTask = (
  overrides: Partial<AnytimeActionTask> = {},
): AnytimeActionTask => {
  const id = `anytime-action-task-${randomInt()}`;
  return {
    id,
    filename: id,
    type: "task",
    name: `Test Anytime Action Task ${randomInt()}`,
    urlSlug: id,
    category: [],
    industryIds: [],
    sectorIds: [],
    applyToAllUsers: false,
    summaryDescriptionMd: `Test summary ${randomInt()}`,
    contentMd: `Test content ${randomInt()}`,
    issuingAgency: `Test Agency ${randomInt()}`,
    callToActionText: `Test CTA ${randomInt()}`,
    callToActionLink: `https://example.gov/${randomInt()}`,
    ...overrides,
  };
};

export const generateAnytimeActionLicenseReinstatement = (
  overrides: Partial<AnytimeActionLicenseReinstatement> = {},
): AnytimeActionLicenseReinstatement => {
  const id = `license-reinstatement-${randomInt()}`;
  return {
    filename: id,
    type: "license-reinstatement",
    name: `Test License Reinstatement ${randomInt()}`,
    licenseName: "",
    urlSlug: id,
    contentMd: `Test content ${randomInt()}`,
    callToActionLink: `https://example.gov/${randomInt()}`,
    callToActionText: `Test CTA ${randomInt()}`,
    issuingAgency: `Test Agency ${randomInt()}`,
    summaryDescriptionMd: `Test summary ${randomInt()}`,
    category: [],
    ...overrides,
  };
};
