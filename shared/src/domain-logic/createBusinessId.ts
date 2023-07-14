import { v4 as uuidv4 } from "uuid";

export const createBusinessId = (): string => {
  return uuidv4();
};
