import { BusinessUser } from "../lib/types";

export const randomInt = (): number =>
  Math.floor(Math.random() * Math.floor(10000000));

export const generateUser = (
  overrides: Partial<BusinessUser>
): BusinessUser => {
  return {
    name: "some-name-" + randomInt(),
    email: `some-email-${randomInt()}@example.com`,
    id: "some-id-" + randomInt(),
    ...overrides,
  };
};
