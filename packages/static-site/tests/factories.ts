import type { Industry } from "@/domain/content/types";

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
