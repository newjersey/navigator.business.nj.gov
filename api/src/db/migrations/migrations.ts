/* eslint-disable @typescript-eslint/no-explicit-any */

import { migrate_v0_to_v1 } from "./v1_addTaskProgress";
import { migrate_v1_to_v2 } from "./v2_formData_to_onboardingData";
import { migrate_v2_to_v3 } from "./v3_change_LegalStructure";

export type MigrationFunction = (data: any) => any;
export const randomInt = (): number => Math.floor(Math.random() * Math.floor(10000000));

export const Migrations: MigrationFunction[] = [migrate_v0_to_v1, migrate_v1_to_v2, migrate_v2_to_v3];

export const CURRENT_VERSION = Migrations.length;
