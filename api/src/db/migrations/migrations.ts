/* eslint-disable @typescript-eslint/no-explicit-any */

import { migrate_v9_to_v10 } from "./v10_add_mynjuserkey";
import { migrate_v10_to_v11 } from "./v11_change_license_statuses";
import { migrate_v11_to_v12 } from "./v12_remove_scorp";
import { migrate_v12_to_v13 } from "./v13_add_constructionRenovationPlan";
import { migrate_v13_to_v14 } from "./v14_add_cleaning_aid_industry";
import { migrate_v14_to_v15 } from "./v15_add_retail_industry";
import { migrate_v15_to_v16 } from "./v16_add_user_preferences";
import { migrate_v16_to_v17 } from "./v17_add_operate_section";
import { migrate_v17_to_v18 } from "./v18_add_foodtruck_roadmap";
import { migrate_v18_to_v19 } from "./v19_add_employment_agency_roadmap";
import { migrate_v0_to_v1 } from "./v1_addTaskProgress";
import { migrate_v19_to_v20 } from "./v20_switch_industry_to_id";
import { migrate_v20_to_v21 } from "./v21_add_tax_fields";
import { migrate_v21_to_v22 } from "./v22_switch_legal_structure_to_id";
import { migrate_v22_to_v23 } from "./v23_rename_onboardingData_to_profileData";
import { migrate_v23_to_v24 } from "./v24_restructure_tax_filings";
import { migrate_v24_to_v25 } from "./v25_add_intercom_hash_to_user";
import { migrate_v25_to_v26 } from "./v26_remove_dateofformation";
import { migrate_v26_to_v27 } from "./v27_add_registration_optouts";
import { migrate_v27_to_v28 } from "./v28_add_hasExistingBusiness_to_profile";
import { migrate_v28_to_v29 } from "./v29_add_certifications_profile";
import { migrate_v1_to_v2 } from "./v2_formData_to_onboardingData";
import { migrate_v29_to_v30 } from "./v30_add_existingEmployees";
import { migrate_v30_to_v31 } from "./v31_3rd_party_status";
import { migrate_v31_to_v32 } from "./v32_3rd_party_status_status";
import { migrate_v32_to_v33 } from "./v33_formation_data";
import { migrate_v33_to_v34 } from "./v34_add_contact_to_formation_data";
import { migrate_v34_to_v35 } from "./v35_add_formation_getfiling_response";
import { migrate_v35_to_v36 } from "./v36_add_member_to_formation_data";
import { migrate_v36_to_v37 } from "./v37_add_dateofformation";
import { migrate_v37_to_v38 } from "./v38_swap_certification_for_ownership";
import { migrate_v38_to_v39 } from "./v39_add_tax_pin";
import { migrate_v2_to_v3 } from "./v3_change_LegalStructure";
import { migrate_v39_to_v40 } from "./v40_merge_down_steps";
import { migrate_v40_to_v41 } from "./v41_remove_operate_section";
import { migrate_v41_to_v42 } from "./v42_add_sector_to_profile_data";
import { migrate_v42_to_v43 } from "./v43_add_initial_flow_to_profile_data";
import { migrate_v43_to_v44 } from "./v44_add_cannabis_license_to_profile_data";
import { migrate_v44_to_v45 } from "./v45_add_hidden_opportunities_to_preferences";
import { migrate_v45_to_v46 } from "./v46_add_task_item_checklist";
import { migrate_v46_to_v47 } from "./v47_add_profile_documents";
import { migrate_v47_to_v48 } from "./v48_add_ab_experience";
import { migrate_v3_to_v4 } from "./v4_add_municipality";
import { migrate_v4_to_v5 } from "./v5_add_liquor_license";
import { migrate_v5_to_v6 } from "./v6_add_home_based_business";
import { migrate_v6_to_v7 } from "./v7_add_license_data";
import { migrate_v7_to_v8 } from "./v8_remove_bcorp";
import { migrate_v8_to_v9 } from "./v9_add_license_status_to_data";

export type MigrationFunction = (data: any) => any;
export const randomInt = (): number => Math.floor(Math.random() * Math.floor(10000000));

export const Migrations: MigrationFunction[] = [
  migrate_v0_to_v1,
  migrate_v1_to_v2,
  migrate_v2_to_v3,
  migrate_v3_to_v4,
  migrate_v4_to_v5,
  migrate_v5_to_v6,
  migrate_v6_to_v7,
  migrate_v7_to_v8,
  migrate_v8_to_v9,
  migrate_v9_to_v10,
  migrate_v10_to_v11,
  migrate_v11_to_v12,
  migrate_v12_to_v13,
  migrate_v13_to_v14,
  migrate_v14_to_v15,
  migrate_v15_to_v16,
  migrate_v16_to_v17,
  migrate_v17_to_v18,
  migrate_v18_to_v19,
  migrate_v19_to_v20,
  migrate_v20_to_v21,
  migrate_v21_to_v22,
  migrate_v22_to_v23,
  migrate_v23_to_v24,
  migrate_v24_to_v25,
  migrate_v25_to_v26,
  migrate_v26_to_v27,
  migrate_v27_to_v28,
  migrate_v28_to_v29,
  migrate_v29_to_v30,
  migrate_v30_to_v31,
  migrate_v31_to_v32,
  migrate_v32_to_v33,
  migrate_v33_to_v34,
  migrate_v34_to_v35,
  migrate_v35_to_v36,
  migrate_v36_to_v37,
  migrate_v37_to_v38,
  migrate_v38_to_v39,
  migrate_v39_to_v40,
  migrate_v40_to_v41,
  migrate_v41_to_v42,
  migrate_v42_to_v43,
  migrate_v43_to_v44,
  migrate_v44_to_v45,
  migrate_v45_to_v46,
  migrate_v46_to_v47,
  migrate_v47_to_v48,
];

export const CURRENT_VERSION = Migrations.length;
