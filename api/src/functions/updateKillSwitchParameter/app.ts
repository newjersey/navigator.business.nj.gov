import { updateKillSwitch } from "@libs/ssmUtils";

export default async function handler(): Promise<void> {
  await updateKillSwitch(true);
}
