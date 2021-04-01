/* eslint-disable @typescript-eslint/no-explicit-any */

import { migrate_v0_to_v1 } from "./v1_addTaskProgress";

export type MigrationFunction = (data: any) => any;

export const Migrations: MigrationFunction[] = [migrate_v0_to_v1];

export const CURRENT_VERSION = Migrations.length;
