// eslint-disable-next-line no-undef
const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || "";

const sendEvent = (category, action, label, value = undefined) => {
  const response = {
    event_category: category,
    event_label: label,
  };
  if (value && Number.parseInt(value) >= 0) response["value"] = Number.parseInt(value);
  window.gtag("event", action, response);
};

export default {
  pageview: (path) => {
    window.gtag("config", GOOGLE_ANALYTICS_ID, {
      page_path: path,
    });
  },

  dimensions: {
    industry: (value) => {
      window.gtag("set", "dimension1", value);
    },
    municipality: (value) => {
      window.gtag("set", "dimension2", value);
    },
    legalStructure: (value) => {
      window.gtag("set", "dimension3", value);
    },
    liquorLicense: (value) => {
      window.gtag("set", "dimension4", value);
    },
    homeBasedBusiness: (value) => {
      window.gtag("set", "dimension5", value);
    },
    persona: (value) => {
      window.gtag("set", "dimension6", value);
    },
    registrationStatus: (value) => {
      window.gtag("set", "dimension7", value);
    },
    abExperience: (value) => {
      window.gtag("set", "dimension8", value);
    },
    naicsCode: (value) => {
      window.gtag("set", "dimension9", value);
    },
    phase: (value) => {
      window.gtag("set", "dimension11", value);
    },
    subPersona: (value) => {
      window.gtag("set", "dimension12", value);
    },
  },

  event: {
    landing_page_hero_log_in: {
      click: {
        go_to_myNJ_login: () => {
          sendEvent("landing_page_hero_log_in", "click", "go_to_myNJ_login");
        },
      },
    },
    landing_page_hero_get_started: {
      click: {
        go_to_onboarding: () => {
          sendEvent("landing_page_hero_get_started", "click", "go_to_onboarding");
        },
      },
    },
    landing_page_navbar_log_in: {
      click: {
        go_to_myNJ_login: () => {
          sendEvent("landing_page_navbar_log_in", "click", "go_to_myNJ_login");
        },
      },
    },
    landing_page_navbar_register: {
      click: {
        go_to_onboarding: () => {
          sendEvent("landing_page_navbar_register", "click", "go_to_onboarding");
        },
      },
    },
    landing_page_second_get_started: {
      click: {
        go_to_onboarding: () => {
          sendEvent("landing_page_second_get_started", "click", "go_to_onboarding");
        },
      },
    },
    landing_page_find_funding: {
      click: {
        go_to_onboarding: () => {
          sendEvent("landing_page_find_funding", "click", "go_to_onboarding");
        },
      },
    },
    guest_snackbar: {
      click: {
        go_to_myNJ_registration: () => {
          sendEvent("guest_toast", "click", "go_to_myNJ_registration");
        },
      },
    },
    guest_modal: {
      click: {
        go_to_myNJ_registration: () => {
          sendEvent("guest_modal", "click", "go_to_myNJ_registration");
        },
        go_to_myNJ_login: () => {
          sendEvent("guest_modal", "click", "go_to_myNJ_login");
        },
      },
    },
    guest_menu: {
      click: {
        go_to_myNJ_registration: () => {
          sendEvent("guest_menu", "click", "go_to_myNJ_registration");
        },
        go_to_myNJ_login: () => {
          sendEvent("guest_modal", "click", "go_to_myNJ_login");
        },
      },
    },
    roadmap_dashboard: {
      arrive: {
        arrive_from_myNJ_registration: () => {
          sendEvent("roadmap_dashboard", "arrive", "arrive_from_myNJ_registration");
        },
        progress_to_needs_to_register_phase: () => {
          sendEvent("roadmap_dashboard", "arrive", "progress_to_needs_to_register_phase");
        },
        progress_to_formed_and_registered_phase: () => {
          sendEvent("roadmap_dashboard", "arrive", "progress_to_formed_and_registered_phase");
        },
        progress_to_up_and_running_phase: () => {
          sendEvent("roadmap_dashboard", "arrive", "progress_to_up_and_running_phase");
        },
      },
    },
    roadmap_task_title: {
      click: {
        go_to_task: () => {
          sendEvent("roadmap_task_title", "click", "go_to_task");
        },
      },
    },
    roadmap_logout_button: {
      click: {
        log_out: () => {
          sendEvent("roadmap_logout_button", "click", "log_out");
        },
      },
    },
    roadmap_profile_edit_button: {
      click: {
        go_to_profile_screen: () => {
          sendEvent("roadmap_profile_edit_button", "click", "go_to_profile_screen");
        },
      },
    },
    roadmap_PBS_link: {
      click: {
        go_to_PBS: () => {
          sendEvent("roadmap_PBS_link", "click", "go_to_PBS");
        },
      },
    },
    roadmap_footer_live_chat_link: {
      click: {
        open_live_chat: () => {
          sendEvent("roadmap_footer_live_chat_link", "click", "open_live_chat");
        },
      },
    },
    roadmap_section: {
      click: {
        expand_contract: () => {
          sendEvent("roadmap_section", "click", "expand_contract");
        },
      },
    },
    dashboard_ungraduate_button: {
      click: {
        existing_dashboard_to_prospective_roadmap: () => {
          sendEvent("dashboard_ungraduate_button", "click", "existing_dashboard_to_prospective_roadmap");
        },
      },
    },
    profile_save: {
      click: {
        save_profile_changes: () => {
          sendEvent("profile_save", "click", "save_profile_changes");
        },
      },
    },
    profile_back_to_roadmap: {
      click: {
        view_roadmap: () => {
          sendEvent("profile_back_to_roadmap", "click", "view_roadmap");
        },
      },
    },
    task_back_to_roadmap: {
      click: {
        view_roadmap: () => {
          sendEvent("task_back_to_roadmap", "click", "view_roadmap");
        },
      },
    },
    task_mini_roadmap_step: {
      click: {
        expand_contract: () => {
          sendEvent("task_mini_roadmap_step", "click", "expand_contract");
        },
      },
    },
    task_mini_roadmap_task: {
      click: {
        go_to_task: () => {
          sendEvent("task_mini_roadmap_task", "click", "go_to_task");
        },
      },
    },
    task_primary_call_to_action: {
      click: {
        open_external_website: () => {
          sendEvent("task_primary_call_to_action", "click", "open_external_website");
        },
      },
    },
    task_tab_start_application: {
      click: {
        view_application_tab: () => {
          sendEvent("task_tab_start_application", "click", "view_application_tab");
        },
      },
    },
    task_tab_check_status: {
      click: {
        view_status_tab: () => {
          sendEvent("task_tab_check_status", "click", "view_status_tab");
        },
      },
    },
    task_button_i_already_submitted: {
      click: {
        view_status_tab: () => {
          sendEvent("task_button_i_already_submitted", "click", "view_status_tab");
        },
      },
    },
    task_address_form: {
      submit: {
        submitted_address_form: () => {
          sendEvent("task_address_form", "submit", "submitted_address_form");
        },
      },
      response: {
        fail_application_not_found: () => {
          sendEvent("task_address_form", "response", "fail_application_not_found");
        },
        success_application_found: () => {
          sendEvent("task_address_form", "response", "success_application_found");
        },
      },
    },
    task_status_checklist_edit_button: {
      click: {
        edit_address_form: () => {
          sendEvent("task_status_checklist_edit_button", "click", "edit_address_form");
        },
      },
    },
    task_status: {
      click: {
        dropdown_appears: () => {
          sendEvent("task_status", "click", "dropdown_appears");
        },
      },
    },
    task_status_checkbox: {
      click: {
        selected_not_started_status: () => {
          sendEvent("task_status_checkbox", "click", "selected_not_started_status");
        },
        selected_in_progress_status: () => {
          sendEvent("task_status_checkbox", "click", "selected_in_progress_status");
        },
        selected_completed_status: () => {
          sendEvent("task_status_checkbox", "click", "selected_completed_status");
        },
      },
      click_completed: {
        show_formation_date_modal: () => {
          sendEvent("task_status_checkbox", "click_completed", "show_formation_date_modal");
        },
        show_tax_registration_date_modal: () => {
          sendEvent("task_status_checkbox", "click_completed", "show_tax_registration_date_modal");
        },
      },
    },
    formation_date_modal: {
      submit: {
        formation_status_set_to_complete: () => {
          sendEvent("formation_date_modal", "submit", "formation_status_set_to_complete");
        },
      },
    },
    task_tax_registration_date_modal: {
      submit: {
        tax_registration_status_set_to_complete: () => {
          sendEvent("task_tax_registration_date_modal", "submit", "tax_registration_status_set_to_complete");
        },
      },
    },
    contextual_link: {
      click: {
        view_sidebar: () => {
          sendEvent("contextual_link", "click", "view_sidebar");
        },
      },
    },
    tooltip: {
      mouseover: {
        view_tooltip: () => {
          sendEvent("tooltip", "mouseover", "view_tooltip");
        },
      },
    },
    external_link: {
      click: {
        open_external_website: () => {
          sendEvent("external_link", "click", "open_external_website");
        },
      },
    },
    contextual_sidebar: {
      click_outside: {
        close_contextual_sidebar: () => {
          sendEvent("contextual_sidebar", "click_outside", "close_contextual_sidebar");
        },
      },
    },
    contextual_sidebar_close_button: {
      click: {
        close_contextual_sidebar: () => {
          sendEvent("contextual_sidebar_close_button", "click", "close_contextual_sidebar");
        },
      },
    },
    mobile_hamburger_icon: {
      click: {
        open_mobile_menu: () => {
          sendEvent("mobile_hamburger_icon", "click", "open_mobile_menu");
        },
      },
    },
    mobile_menu_close_button: {
      click: {
        close_mobile_menu: () => {
          sendEvent("mobile_menu_close_button", "click", "close_mobile_menu");
        },
      },
    },
    mobile_menu: {
      click_outside: {
        close_mobile_menu: () => {
          sendEvent("mobile_menu", "click_outside", "close_mobile_menu");
        },
      },
    },
    task_business_name_check_availability: {
      submit: {
        view_business_name_availability: () => {
          sendEvent("task_business_name_check_availability", "submit", "view_business_name_availability");
        },
      },
    },
    account_menu_my_profile: {
      click: {
        go_to_profile_screen: () => {
          sendEvent("account_menu_my_profile", "click", "go_to_profile_screen");
        },
      },
    },
    account_menu_myNJ_account: {
      click: {
        go_to_myNJ_home: () => {
          sendEvent("account_menu_myNJ_account", "click", "go_to_myNJ_home");
        },
      },
    },
    account_name: {
      click: {
        expand_account_menu: () => {
          sendEvent("account_name", "click", "expand_account_menu");
        },
      },
    },
    onboarding_last_step: {
      submit: {
        finish_onboarding: () => {
          sendEvent("onboarding_last_step", "submit", "finish_onboarding");
        },
      },
    },
    onboarding_moving_company_question: {
      submit: {
        yes_moving_across_state_lines: () => {
          sendEvent("onboarding_moving_company_question", "submit", "yes_moving_across_state_lines");
        },
        no_moving_across_state_lines: () => {
          sendEvent("onboarding_moving_company_question", "submit", "no_moving_across_state_lines");
        },
      },
    },
    onboarding_cpa_question: {
      submit: {
        yes_i_offer_public_accounting: () => {
          sendEvent("onboarding_cpa_question", "submit", "yes_i_offer_public_accounting");
        },
        no_i_dont_offer_public_accounting: () => {
          sendEvent("onboarding_cpa_question", "submit", "no_i_dont_offer_public_accounting");
        },
      },
    },
    onboarding_cannabis_question: {
      submit: {
        conditional_cannabis_license: () => {
          sendEvent("onboarding_cannabis_question", "submit", "conditional_cannabis_license");
        },
        annual_cannabis_license: () => {
          sendEvent("onboarding_cannabis_question", "submit", "annual_cannabis_license");
        },
      },
    },
    business_formation: {
      submit: {
        go_to_NIC_formation_processing: () => {
          sendEvent("business_formation", "submit", "go_to_NIC_formation_processing");
        },
        error_remain_at_formation: () => {
          sendEvent("business_formation", "submit", "error_remain_at_formation");
        },
      },
    },
    business_formation_success_screen: {
      arrive: {
        arrive_from_NIC_formation_processing: () => {
          sendEvent("business_formation_success_screen", "arrive", "arrive_from_NIC_formation_processing");
        },
      },
    },
    business_formation_business_name_edit: {
      click: {
        go_to_name_search_step: () => {
          sendEvent("business_formation_business_name_edit", "click", "go_to_name_search_step");
        },
      },
    },
    business_formation_legal_structure_edit: {
      click: {
        show_legal_structure_modal: () => {
          sendEvent("business_formation_legal_structure_edit", "click", "show_legal_structure_modal");
        },
      },
    },
    business_formation_legal_structure_modal: {
      submit: {
        go_to_profile_screen: () => {
          sendEvent("business_formation_legal_structure_edit", "click", "go_to_profile_screen");
        },
      },
    },
    business_formation_name_step: {
      arrive: {
        arrive_on_business_formation_name_step: () => {
          sendEvent("business_formation_name_step", "arrive", "arrive_on_business_formation_name_step");
        },
      },
    },
    business_formation_name_step_continue_button: {
      click: {
        arrive_on_business_formation_business_step: () => {
          sendEvent(
            "business_formation_name_step_continue_button",
            "click",
            "arrive_on_business_formation_business_step"
          );
        },
      },
    },
    business_formation_business_step_continue_button: {
      click: {
        arrive_on_business_formation_contacts_step: () => {
          sendEvent(
            "business_formation_business_step_continue_button",
            "click",
            "arrive_on_business_formation_contacts_step"
          );
        },
      },
    },
    business_formation_contacts_step_continue_button: {
      click: {
        arrive_on_business_formation_billing_step: () => {
          sendEvent(
            "business_formation_contacts_step_continue_button",
            "click",
            "arrive_on_business_formation_billing_step"
          );
        },
      },
    },
    business_formation_billing_step_continue_button: {
      click: {
        arrive_on_business_formation_review_step: () => {
          sendEvent(
            "business_formation_billing_step_continue_button",
            "click",
            "arrive_on_business_formation_review_step"
          );
        },
      },
    },
    business_formation_registered_agent_identification: {
      submit: {
        entered_agent_ID: () => {
          sendEvent("business_formation_registered_agent_identification", "submit", "entered_agent_ID");
        },
        identified_agent_manually: () => {
          sendEvent(
            "business_formation_registered_agent_identification",
            "submit",
            "identified_agent_manually"
          );
        },
      },
    },
    business_formation_registered_agent_manual_name: {
      submit: {
        name_is_same_as_account_holder: () => {
          sendEvent(
            "business_formation_registered_agent_manual_name",
            "submit",
            "name_is_same_as_account_holder"
          );
        },
      },
    },
    business_formation_registered_agent_manual_address: {
      submit: {
        address_is_same_as_account_holder: () => {
          sendEvent(
            "business_formation_registered_agent_manual_address",
            "submit",
            "address_is_same_as_account_holder"
          );
        },
      },
    },
    business_formation_members: {
      submit: {
        members_submitted_with_formation: (number) => {
          sendEvent("business_formation_members", "submit", "members_submitted_with_formation", number);
        },
      },
    },
    business_formation_signers: {
      submit: {
        signers_submitted_with_formation: (number) => {
          sendEvent("business_formation_signers", "submit", "signers_submitted_with_formation", number);
        },
      },
    },
    business_formation_provisions: {
      submit: {
        provisions_submitted_with_formation: (number) => {
          sendEvent("business_formation_provisions", "submit", "provisions_submitted_with_formation", number);
        },
      },
    },
    business_formation_purpose: {
      submit: {
        purpose_submitted_with_formation: () => {
          sendEvent("business_formation_purpose", "submit", "purpose_submitted_with_formation");
        },
      },
    },
    business_formation_name_tab: {
      click: {
        arrive_on_business_formation_name_step: () => {
          sendEvent("business_formation_name_tab", "click", "arrive_on_business_formation_name_step");
        },
      },
    },
    business_formation_business_tab: {
      click: {
        arrive_on_business_formation_business_step: () => {
          sendEvent("business_formation_business_tab", "click", "arrive_on_business_formation_business_step");
        },
      },
    },
    business_formation_contacts_tab: {
      click: {
        arrive_on_business_formation_contacts_step: () => {
          sendEvent("business_formation_contacts_tab", "click", "arrive_on_business_formation_contacts_step");
        },
      },
    },
    business_formation_billing_tab: {
      click: {
        arrive_on_business_formation_billing_step: () => {
          sendEvent("business_formation_billing_tab", "click", "arrive_on_business_formation_billing_step");
        },
      },
    },
    business_formation_review_tab: {
      click: {
        arrive_on_business_formation_review_step: () => {
          sendEvent("business_formation_review_tab", "click", "arrive_on_business_formation_review_step");
        },
      },
    },
    cannabis_license_form_microbusiness_question: {
      submit: {
        yes_I_m_a_microbusiness: () => {
          sendEvent("cannabis_license_form_microbusiness_question", "submit", "yes_I_m_a_microbusiness");
        },
        no_I_m_a_standard_business: () => {
          sendEvent("cannabis_license_form_microbusiness_question", "submit", "no_I_m_a_standard_business");
        },
      },
    },
    cannabis_license_form: {
      click: {
        view_requirements: () => {
          sendEvent("cannabis_license_form", "click", "view_requirements");
        },
      },
    },
    cannabis_license_form_priority_status_diversity_checkbox: {
      submit: {
        diversely_owned_business: () => {
          sendEvent(
            "cannabis_license_form_priority_status_diversity_checkbox",
            "submit",
            "diversely_owned_business"
          );
        },
      },
    },
    cannabis_license_form_priority_status_impact_checkbox: {
      submit: {
        impact_zone_business: () => {
          sendEvent(
            "cannabis_license_form_priority_status_impact_checkbox",
            "submit",
            "impact_zone_business"
          );
        },
      },
    },
    cannabis_license_form_priority_status_social_equity_checkbox: {
      submit: {
        social_equity_business: () => {
          sendEvent(
            "cannabis_license_form_priority_status_social_equity_checkbox",
            "submit",
            "social_equity_business"
          );
        },
      },
    },
    calendar_date: {
      click: {
        go_to_date_detail_screen: () => {
          sendEvent("calendar_date", "click", "go_to_date_detail_screen");
        },
      },
    },

    tax_calendar_banner_button: {
      click: {
        show_tax_calendar_modal: () =>
          sendEvent("tax_calendar_banner_button", "click", "show_tax_calendar_modal"),
        show_myNJ_registration_prompt_modal: () =>
          sendEvent("tax_calendar_banner_button", "click", "show_myNJ_registration_prompt_modal"),
      },
    },
    tax_calendar_modal: {
      submit: {
        tax_calendar_modal_validation_error: () =>
          sendEvent("tax_calendar_modal", "submit", "tax_calendar_modal_validation_error"),
        tax_calendar_business_does_not_exist: () =>
          sendEvent("tax_calendar_modal", "submit", "tax_calendar_business_does_not_exist"),
        business_exists_but_not_in_Gov2Go: () =>
          sendEvent("tax_calendar_modal", "submit", "business_exists_but_not_in_Gov2Go"),
        tax_deadlines_added_to_calendar: () =>
          sendEvent("tax_calendar_modal", "submit", "tax_deadlines_added_to_calendar"),
      },
    },
    tax_registration_nudge_button: {
      click: {
        show_tax_registration_modal: () =>
          sendEvent("tax_registration_nudge_button", "click", "show_tax_registration_modal"),
      },
    },
    tax_registration_modal: {
      submit: {
        tax_registration_status_set_to_complete: () =>
          sendEvent("tax_registration_modal", "submit", "tax_registration_status_set_to_complete"),
      },
    },
    business_formation_review_amendments_external_link: {
      click: {
        go_to_Treasury_amendments_page: () => {
          sendEvent(
            "business_formation_review_amendments_external_link",
            "click",
            "go_to_Treasury_amendments_page"
          );
        },
      },
    },
    business_formation_success_amendments_external_link: {
      click: {
        go_to_Treasury_amendments_page: () => {
          sendEvent(
            "business_formation_success_amendments_external_link",
            "click",
            "go_to_Treasury_amendments_page"
          );
        },
      },
    },
    onboarding_car_service_question: {
      submit: {
        taxi_size: () => {
          sendEvent("onboarding_car_service_question", "submit", "taxi_size");
        },
        large_size: () => {
          sendEvent("onboarding_car_service_question", "submit", "large_size");
        },
        both_sizes: () => {
          sendEvent("onboarding_car_service_question", "submit", "both_sizes");
        },
      },
    },
    onboarding_logistics_business_question: {
      submit: {
        yes_moving_across_state_lines: () => {
          sendEvent("onboarding_logistics_business_question", "submit", "yes_moving_across_state_lines");
        },
        no_not_moving_across_state_lines: () => {
          sendEvent("onboarding_logistics_business_question", "submit", "no_not_moving_across_state_lines");
        },
      },
    },
    myNJ_prompt_modal_complete_button: {
      click: {
        go_to_myNJ_registration: () => {
          sendEvent("myNJ_prompt_modal_complete_button", "click", "go_to_myNJ_registration");
        },
      },
    },
  },
};
