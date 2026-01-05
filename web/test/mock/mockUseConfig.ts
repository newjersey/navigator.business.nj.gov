import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import * as useConfigModule from "@/lib/data-hooks/useConfig";

// React 19: Since useConfig is no longer a jest.Mock, we need to spy on it
export const useMockConfig = (): void => {
  // Create a spy on the module's useConfig function
  jest.spyOn(useConfigModule, "useConfig").mockReturnValue({ Config: getMergedConfig() });
};
