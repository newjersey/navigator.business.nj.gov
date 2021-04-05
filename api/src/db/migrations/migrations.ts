/* eslint-disable @typescript-eslint/no-explicit-any */

import { migrate_v0_to_v1 } from "./v1_addTaskProgress";
import { migrate_v1_to_v2 } from "./v2_formData_to_onboardingData";

export type MigrationFunction = (data: any) => any;

export const Migrations: MigrationFunction[] = [migrate_v0_to_v1, migrate_v1_to_v2];

export const CURRENT_VERSION = Migrations.length;
