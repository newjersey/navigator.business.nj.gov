import { updateKillSwitch } from "@libs/ssmUtils";

export const handler = async (): Promise<void> => {
  await updateKillSwitch();
};
