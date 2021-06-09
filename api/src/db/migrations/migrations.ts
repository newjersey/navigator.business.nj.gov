/* eslint-disable @typescript-eslint/no-explicit-any */

import { migrate_v0_to_v1 } from "./v1_addTaskProgress";
import { migrate_v1_to_v2 } from "./v2_formData_to_onboardingData";
import { migrate_v2_to_v3 } from "./v3_change_LegalStructure";
import { migrate_v3_to_v4 } from "./v4_add_municipality";
import { migrate_v4_to_v5 } from "./v5_add_liquor_license";
import {migrate_v5_to_v6} from "./v6_add_home_based_business";
import {migrate_v6_to_v7} from "./v7_add_license_data";

export type MigrationFunction = (data: any) => any;
export const randomInt = (): number => Math.floor(Math.random() * Math.floor(10000000));

export const Migrations: MigrationFunction[] = [
  migrate_v0_to_v1,
  migrate_v1_to_v2,
  migrate_v2_to_v3,
  migrate_v3_to_v4,
  migrate_v4_to_v5,
  migrate_v5_to_v6,
  migrate_v6_to_v7
];

export const CURRENT_VERSION = Migrations.length;
