/* eslint-disable @typescript-eslint/no-explicit-any */

import { migrate_v99_to_v100 } from "./v100_add_updated_timestamp";
import { migrate_v100_to_v101 } from "./v101_change_error_field";
import { migrate_v101_to_v102 } from "./v102_rename_tax_registration_nudge";
import { migrate_v102_to_v103 } from "./v103_change_tax_calendar_view_default";
import { migrate_v103_to_v104 } from "./v104_add_needs_nexus_dba_name_field";
import { migrate_v104_to_v105 } from "./v105_add_pet_care_essential_question";
import { migrate_v105_to_v106 } from "./v106_add_pet_care_housing_essential_question";
import { migrate_v106_to_v107 } from "./v107_refactor_interstate_transport_essential_question";
import { migrate_v107_to_v108 } from "./v108_add_business_name_search_to_formation_data";
import { migrate_v108_to_v109 } from "./v109_add_business_name_search_timestamp";
import { migrate_v9_to_v10 } from "./v10_add_mynjuserkey";
import { migrate_v109_to_v110 } from "./v110_rename_form_progress_to_onboarding_form_progress";
import { migrate_v110_to_v111 } from "./v111_add_date_created_and_initial_version";
import { migrate_v111_to_v112 } from "./v112_add_last_visited_formation_page_to_formation_data";
import { migrate_v112_to_v113 } from "./v113_add_business_structure_task_completion";
import { migrate_v113_to_v114 } from "./v114_add_expired_iso_field_to_license";
import { migrate_v114_to_v115 } from "./v115_rename_tax_filings";
import { migrate_v115_to_v116 } from "./v116_add_dba_business_name_availability";
import { migrate_v116_to_v117 } from "./v117_add_onboarding_nonprofit";
import { migrate_v117_to_v118 } from "./v118_set_operating_phase_remote_seller_worker";
import { migrate_v118_to_v119 } from "./v119_update_structure_to_multiple_businesses";
import { migrate_v10_to_v11 } from "./v11_change_license_statuses";
import { migrate_v119_to_v120 } from "./v120_add_missing_migration_data_fields";
import { migrate_v120_to_v121 } from "./v121_add_nonprofit_formation_fields";
import { migrate_v11_to_v12 } from "./v12_remove_scorp";
import { migrate_v12_to_v13 } from "./v13_add_construction_renovation_plan";
import { migrate_v13_to_v14 } from "./v14_add_cleaning_aid_industry";
import { migrate_v14_to_v15 } from "./v15_add_retail_industry";
import { migrate_v15_to_v16 } from "./v16_add_user_preferences";
import { migrate_v16_to_v17 } from "./v17_add_operate_section";
import { migrate_v17_to_v18 } from "./v18_add_foodtruck_roadmap";
import { migrate_v18_to_v19 } from "./v19_add_employment_agency_roadmap";
import { migrate_v0_to_v1 } from "./v1_add_task_progress";
import { migrate_v19_to_v20 } from "./v20_switch_industry_to_id";
import { migrate_v20_to_v21 } from "./v21_add_tax_fields";
import { migrate_v21_to_v22 } from "./v22_switch_legal_structure_to_id";
import { migrate_v22_to_v23 } from "./v23_rename_onboarding_data_to_profile_data";
import { migrate_v23_to_v24 } from "./v24_restructure_tax_filings";
import { migrate_v24_to_v25 } from "./v25_add_intercom_hash_to_user";
import { migrate_v25_to_v26 } from "./v26_remove_dateofformation";
import { migrate_v26_to_v27 } from "./v27_add_registration_optouts";
import { migrate_v27_to_v28 } from "./v28_add_has_existing_business_to_profile";
import { migrate_v28_to_v29 } from "./v29_add_certifications_profile";
import { migrate_v1_to_v2 } from "./v2_form_data_to_onboarding_data";
import { migrate_v29_to_v30 } from "./v30_add_existing_employees";
import { migrate_v30_to_v31 } from "./v31_3rd_party_status";
import { migrate_v31_to_v32 } from "./v32_3rd_party_status_status";
import { migrate_v32_to_v33 } from "./v33_formation_data";
import { migrate_v33_to_v34 } from "./v34_add_contact_to_formation_data";
import { migrate_v34_to_v35 } from "./v35_add_formation_getfiling_response";
import { migrate_v35_to_v36 } from "./v36_add_member_to_formation_data";
import { migrate_v36_to_v37 } from "./v37_add_dateofformation";
import { migrate_v37_to_v38 } from "./v38_swap_certification_for_ownership";
import { migrate_v38_to_v39 } from "./v39_add_tax_pin";
import { migrate_v2_to_v3 } from "./v3_change_legal_structure";
import { migrate_v39_to_v40 } from "./v40_merge_down_steps";
import { migrate_v40_to_v41 } from "./v41_remove_operate_section";
import { migrate_v41_to_v42 } from "./v42_add_sector_to_profile_data";
import { migrate_v42_to_v43 } from "./v43_add_initial_flow_to_profile_data";
import { migrate_v43_to_v44 } from "./v44_add_cannabis_license_to_profile_data";
import { migrate_v44_to_v45 } from "./v45_add_hidden_opportunities_to_preferences";
import { migrate_v45_to_v46 } from "./v46_add_task_item_checklist";
import { migrate_v46_to_v47 } from "./v47_add_profile_documents";
import { migrate_v47_to_v48 } from "./v48_add_ab_experience";
import { migrate_v48_to_v49 } from "./v49_add_cannabis_microbusiness";
import { migrate_v3_to_v4 } from "./v4_add_municipality";
import { migrate_v49_to_v50 } from "./v50_fix_annual_conditional_ids";
import { migrate_v50_to_v51 } from "./v51_add_cpa_field";
import { migrate_v51_to_v52 } from "./v52_add_naics_code";
import { migrate_v52_to_v53 } from "./v53_migrate_cannabis_dvob";
import { migrate_v53_to_v54 } from "./v54_add_business_purpose";
import { migrate_v54_to_v55 } from "./v55_marketing_and_pr";
import { migrate_v55_to_v56 } from "./v56_cleaning_janatorial";
import { migrate_v56_to_v57 } from "./v57_add_provisions";
import { migrate_v57_to_v58 } from "./v58_add_welcome_card_to_preferences";
import { migrate_v58_to_v59 } from "./v59_fix_welcome_card_to_preferences";
import { migrate_v4_to_v5 } from "./v5_add_liquor_license";
import { migrate_v59_to_v60 } from "./v60_add_llp_suffix";
import { migrate_v60_to_v61 } from "./v61_add_corp_formation";
import { migrate_v61_to_v62 } from "./v62_rename_has_existing_business";
import { migrate_v62_to_v63 } from "./v63_add_foreign_persona";
import { migrate_v63_to_v64 } from "./v64_save_formation_address_checkboxes";
import { migrate_v64_to_v65 } from "./v65_add_task_progess_card";
import { migrate_v65_to_v66 } from "./v66_add_nexus_to_profile";
import { migrate_v66_to_v67 } from "./v67_add_graduation_card";
import { migrate_v67_to_v68 } from "./v68_complete_formation_task_if_success";
import { migrate_v68_to_v69 } from "./v69_change_form_business_entity_foreign_id";
import { migrate_v5_to_v6 } from "./v6_add_home_based_business";
import { migrate_v69_to_v70 } from "./v70_add_staffing_service";
import { migrate_v70_to_v71 } from "./v71_add_certified_interior_designer";
import { migrate_v71_to_v72 } from "./v72_add_real_estate_management";
import { migrate_v72_to_v73 } from "./v73_add_operating_status_field";
import { migrate_v73_to_v74 } from "./v74_change_register_for_taxes_foreign_id";
import { migrate_v74_to_v75 } from "./v75_fix_trade_name_operating_phase";
import { migrate_v75_to_v76 } from "./v76_fix_trade_name_operating_phase_round_2";
import { migrate_v76_to_v77 } from "./v77_remove_graduation_card";
import { migrate_v77_to_v78 } from "./v78_remove_initial_business_persona";
import { migrate_v78_to_v79 } from "./v79_add_return_to_link";
import { migrate_v6_to_v7 } from "./v7_add_license_data";
import { migrate_v79_to_v80 } from "./v80_add_calendar_preference";
import { migrate_v80_to_v81 } from "./v81_add_completed_filing_payment";
import { migrate_v81_to_v82 } from "./v82_add_up_and_running_owning_operating_phase";
import { migrate_v82_to_v83 } from "./v83_add_hideable_roadmap_to_preferences";
import { migrate_v83_to_v84 } from "./v84_fix_completed_filing";
import { migrate_v84_to_v85 } from "./v85_add_tax_filing_state";
import { migrate_v85_to_v86 } from "./v86_tax_filing_var_rename";
import { migrate_v86_to_v87 } from "./v87_add_car_service";
import { migrate_v87_to_v88 } from "./v88_add_interstate_transport";
import { migrate_v88_to_v89 } from "./v89_tax_filing_registered_bool";
import { migrate_v7_to_v8 } from "./v8_remove_bcorp";
import { migrate_v89_to_v90 } from "./v90_home_based_business_can_be_undefined";
import { migrate_v90_to_v91 } from "./v91_consolidate_section_type";
import { migrate_v91_to_v92 } from "./v92_splits_profiledata_interface";
import { migrate_v92_to_v93 } from "./v93_merge_childcare_roadmaps";
import { migrate_v93_to_v94 } from "./v94_add_missing_formation_types";
import { migrate_v94_to_v95 } from "./v95_added_new_tax_calendar_state";
import { migrate_v95_to_v96 } from "./v96_added_date_field_to_tax_filing_data";
import { migrate_v96_to_v97 } from "./v97_updating_formation_types";
import { migrate_v97_to_v98 } from "./v98_add_phase_newly_changed";
import { migrate_v98_to_v99 } from "./v99_added_encrypted_tax_id";
import { migrate_v8_to_v9 } from "./v9_add_license_status_to_data";

export type MigrationFunction = (data: any) => any;

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
  migrate_v48_to_v49,
  migrate_v49_to_v50,
  migrate_v50_to_v51,
  migrate_v51_to_v52,
  migrate_v52_to_v53,
  migrate_v53_to_v54,
  migrate_v54_to_v55,
  migrate_v55_to_v56,
  migrate_v56_to_v57,
  migrate_v57_to_v58,
  migrate_v58_to_v59,
  migrate_v59_to_v60,
  migrate_v60_to_v61,
  migrate_v61_to_v62,
  migrate_v62_to_v63,
  migrate_v63_to_v64,
  migrate_v64_to_v65,
  migrate_v65_to_v66,
  migrate_v66_to_v67,
  migrate_v67_to_v68,
  migrate_v68_to_v69,
  migrate_v69_to_v70,
  migrate_v70_to_v71,
  migrate_v71_to_v72,
  migrate_v72_to_v73,
  migrate_v73_to_v74,
  migrate_v74_to_v75,
  migrate_v75_to_v76,
  migrate_v76_to_v77,
  migrate_v77_to_v78,
  migrate_v78_to_v79,
  migrate_v79_to_v80,
  migrate_v80_to_v81,
  migrate_v81_to_v82,
  migrate_v82_to_v83,
  migrate_v83_to_v84,
  migrate_v84_to_v85,
  migrate_v85_to_v86,
  migrate_v86_to_v87,
  migrate_v87_to_v88,
  migrate_v88_to_v89,
  migrate_v89_to_v90,
  migrate_v90_to_v91,
  migrate_v91_to_v92,
  migrate_v92_to_v93,
  migrate_v93_to_v94,
  migrate_v94_to_v95,
  migrate_v95_to_v96,
  migrate_v96_to_v97,
  migrate_v97_to_v98,
  migrate_v98_to_v99,
  migrate_v99_to_v100,
  migrate_v100_to_v101,
  migrate_v101_to_v102,
  migrate_v102_to_v103,
  migrate_v103_to_v104,
  migrate_v104_to_v105,
  migrate_v105_to_v106,
  migrate_v106_to_v107,
  migrate_v107_to_v108,
  migrate_v108_to_v109,
  migrate_v109_to_v110,
  migrate_v110_to_v111,
  migrate_v111_to_v112,
  migrate_v112_to_v113,
  migrate_v113_to_v114,
  migrate_v114_to_v115,
  migrate_v115_to_v116,
  migrate_v116_to_v117,
  migrate_v117_to_v118,
  migrate_v118_to_v119,
  migrate_v119_to_v120,
  migrate_v120_to_v121,
];
