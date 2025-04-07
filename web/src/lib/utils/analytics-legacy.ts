export type LegacyEventCategory =
  | "opportunity_card"
  | "contextual_link"
  | "external_link"
  | "task_primary_call_to_action"
  | "task_status_checkbox"
  | "landing_page_how_it_works"
  | "landing_page_more_support"
  | "roadmap_dashboard"
  | "formation_nudge_button"
  | "formation_date_modal"
  | "tax_registration_nudge_button"
  | "tax_registration_modal"
  | "myNJ_prompt_modal_complete_button"
  | "calendar_date"
  | "go_to_profile_nudge_button"
  | "go_to_profile_nudge"
  | "landing_page_hero_get_started"
  | "landing_page_get_my_registration_guide_tile"
  | "landing_page_file_and_pay_my_taxes_tile"
  | "landing_page_im_an_out_of_business_tile"
  | "landing_page_find_funding_for_my_business_tile"
  | "landing_page_im_starting_a_nj_business_tile"
  | "landing_page_im_running_a_nj_business_tile"
  | "landing_page_navbar_register"
  | "landing_page_second_get_started"
  | "landing_page_find_funding"
  | "contextual_sidebar"
  | "contextual_sidebar_close_button"
  | "tooltip"
  | "onboarding_cannabis_question"
  | "onboarding_liquor_question"
  | "onboarding_car_service_question"
  | "onboarding_moving_company_question"
  | "onboarding_logistics_business_question"
  | "onboarding_childcare_business_question"
  | "onboarding_cpa_question"
  | "onboarding_last_step"
  | "onboarding_last_step_save_additional_business_button"
  | "mandatory_field_error"
  | "roadmap_footer_live_chat_link"
  | "share_feedback"
  | "share_calendar_feedback"
  | "tax_calendar_register_button"
  | "tax_calendar"
  | "tax_calendar_v2"
  | "tax_calendar_v2_cta"
  | "calendar_access_v2"
  | "profile_save"
  | "profile_formation_date"
  | "profile_location_question"
  | "task_address_form"
  | "guest_snackbar"
  | "task_location_question"
  | "task_tab_start_application"
  | "task_tab_check_status"
  | "task_button_i_already_submitted"
  | "task_status_checklist_edit_button"
  | "cannabis_license_form_microbusiness_question"
  | "cannabis_license_form_priority_status_diversity_checkbox"
  | "cannabis_license_form_priority_status_impact_checkbox"
  | "cannabis_license_form_priority_status_social_equity_checkbox"
  | "cannabis_license_form"
  | "task_business_name_check_availability"
  | "business_formation_legal_structure_modal"
  | "business_formation_registered_agent_identification"
  | "business_formation_registered_agent_manual_name"
  | "business_formation_registered_agent_manual_address"
  | "business_formation_location_question"
  | "business_formation"
  | "business_formation_members"
  | "business_formation_signers"
  | "business_formation_provisions"
  | "business_formation_purpose"
  | "business_formation_name_step_update_name_on_roadmap"
  | "business_formation_business_name_edit"
  | "business_formation_legal_structure_edit"
  | "business_formation_review_amendments_external_link"
  | "business_formation_success_amendments_external_link"
  | "business_formation_name_tab"
  | "business_formation_business_tab"
  | "business_formation_contacts_tab"
  | "business_formation_billing_tab"
  | "business_formation_review_tab"
  | "business_formation_name_step"
  | "business_formation_name_step_continue_button"
  | "business_formation_business_step_continue_button"
  | "business_formation_contacts_step_continue_button"
  | "business_formation_billing_step_continue_button"
  | "business_formation_dba_resolution_step_continue_button"
  | "business_formation_dba_authorization_step_continue_button"
  | "business_formation_biling_step_continue_button"
  | "business_formation_success_screen"
  | "business_formation_search_existing_name_again"
  | "business_formation_dba_name_search_field"
  | "business_formation_dba_resolution_tab"
  | "business_formation_dba_authorization_tab"
  | "mobile_hamburger_icon"
  | "mobile_menu_close_button"
  | "mobile_menu"
  | "mobile_menu_close_button_quick_links"
  | "mobile_menu_quick_links"
  | "mobile_hamburger_icon_quick_links"
  | "mobile_hamburger_quick_links_updates"
  | "mobile_hamburger_quick_links_grow"
  | "mobile_hamburger_quick_links_start"
  | "mobile_hamburger_quick_links_plan"
  | "mobile_hamburger_quick_links_search"
  | "mobile_hamburger_quick_links_operate"
  | "profile_back_to_roadmap"
  | "task_back_to_roadmap"
  | "task_mini_roadmap_step"
  | "task_mini_roadmap_task"
  | "roadmap_task_title"
  | "account_name"
  | "account_menu_myNJ_account"
  | "account_menu_my_profile"
  | "roadmap_section"
  | "roadmap_profile_edit_button"
  | "landing_page_navbar_log_in"
  | "onboarding_header_login"
  | "guest_header_login"
  | "guest_toast"
  | "guest_modal"
  | "guest_menu"
  | "guest_header_register"
  | "roadmap_logout_button"
  | "landing_page_hero_log_in"
  | "finish_setup_on_myNewJersey_button"
  | "landing_page"
  | "for_you_card_hide_button"
  | "for_you_card_unhide_button"
  | "quick_action_button"
  | "skip_to_main_content_button"
  | "business_formation_help_button"
  | "my_account_link"
  | "business.nj.gov_link"
  | "elevator_registration_button_click_register"
  | "elevator_registration_button_click_update"
  | "check_my_elevator_application_status_tab_click"
  | "elevator_registration_form_submission"
  | "elevator_registration_form_submission_failed"
  | "view_my_violation_note_button_click"
  | "starter_kit_landing_start_now_button"
  | "starter_kit_landing_get_my_starter_kit_button"
  | "starter_kit_landing_get_my_starter_kit_button_footer"
  | "show_me_funding_opportunities_button"
  | "check_account_help_button"
  | "check_account_log_in"
  | "link_your_myNJ_account_link";

export type LegacyEventAction =
  | "click"
  | "scroll"
  | "arrive"
  | "submit"
  | "click_completed"
  | "click_outside"
  | "appears"
  | "mouseover"
  | "appear"
  | "response";

export type LegacyEventLabel =
  | "go_to_opportunity_screen"
  | "view_sidebar"
  | "open_external_website"
  | "selected_not_started_status"
  | "selected_in_progress_status"
  | "show_legal_structure_modal"
  | "selected_completed_status"
  | "view_business_name_availability"
  | "how_it_works_seen"
  | "more_support_seen"
  | "go_to_name_search_step"
  | "progress_to_formed_phase"
  | "progress_to_up_and_running_phase"
  | "show_formation_date_modal"
  | "formation_status_set_to_complete"
  | "tax_registration_status_set_to_complete"
  | "show_tax_registration_date_modal"
  | "go_to_NavigatorAccount_setup"
  | "go_to_date_detail_screen"
  | "go_to_onboarding"
  | "go_to_onboarding "
  | "arrive_from_myNJ_registration"
  | "close_contextual_sidebar"
  | "view_tooltip"
  | "fail_application_not_found"
  | "success_application_found"
  | "view_application_tab"
  | "view_status_tab"
  | "edit_address_form"
  | "view_requirements"
  | "go_to_profile_screen"
  | "go_to_NIC_formation_processing"
  | "error_remain_at_formation"
  | "members_submitted_with_formation"
  | "signers_submitted_with_formation"
  | "provisions_submitted_with_formation"
  | "purpose_submitted_with_formation"
  | "update_name_on_roadmap"
  | "go_to_Treasury_amendments_page"
  | "arrive_on_business_formation_name_step"
  | "arrive_on_business_formation_business_step"
  | "arrive_on_business_formation_contacts_step"
  | "arrive_on_business_formation_billing_step"
  | "arrive_on_business_formation_review_step"
  | "arrive_from_NIC_formation_processing"
  | "refresh_name_search_field"
  | "dba_name_search_field_appears"
  | "arrive_on_business_formation_dba_resolution_step"
  | "arrive_on_business_formation_dba_authorization_step"
  | "open_mobile_menu"
  | "close_mobile_menu"
  | "go_to_search_page"
  | "go_to_update_page"
  | "go_to_grow_page"
  | "go_to_start_page"
  | "go_to_plan_page"
  | "go_to_operate_page"
  | "expand_contract"
  | "go_to_task"
  | "expand_account_menu"
  | "go_to_myNJ_home"
  | "view_roadmap"
  | "log_out"
  | "unlinked_myNJ_account"
  | "get_unlinked_myNJ_account_modal"
  | "conditional_cannabis_license"
  | "annual_cannabis_license"
  | "yes_require_liquor_license"
  | "no_dont_require_liquor_license"
  | "large_size"
  | "taxi_size"
  | "both_sizes"
  | "yes_moving_across_state_lines"
  | "no_not_moving_across_state_lines"
  | "yes_more_than_6_childred"
  | "no_5_or_fewer_children"
  | "yes_i_offer_public_accounting"
  | "no_i_dont_offer_public_accounting"
  | "finish_onboarding"
  | "finish_additional_business_onboarding"
  | "mandatory_field_error"
  | "open_live_chat"
  | "show_myNJ_registration_prompt_modal"
  | "tax_calendar_validation_error"
  | "tax_calendar_business_does_not_exist"
  | "arrive_calendar_access_v2"
  | "tax_calendar_click_calendar_v2"
  | "tax_deadlines_added_to_calendar"
  | "save_profile_changes"
  | "formation_date_changed"
  | "identified_agent_manually"
  | "entered_agent_ID"
  | "location_entered_for_first_time"
  | "submitted_address_form"
  | "name_is_same_as_account_holder"
  | "address_is_same_as_account_holder"
  | "go_to_myNJ_login"
  | "go_to_profile"
  | "no_I_m_a_standard_business"
  | "yes_I_m_a_microbusiness"
  | "impact_zone_business"
  | "diversely_owned_business"
  | "show_feedback_modal"
  | "social_equity_business"
  | "business_exists_but_not_in_Gov2Go"
  | "get_unlinked_myNJ_account"
  | "go_to_myNJ_registration"
  | "hide_card"
  | "unhide_card"
  | "unhide_cards"
  | "go_to_quick_action_screen"
  | "skip_to_main_content"
  | "go_to_dashboard"
  | "go_to_business.nj.gov"
  | "show_calendar"
  | "arrive_calendar_v2";
