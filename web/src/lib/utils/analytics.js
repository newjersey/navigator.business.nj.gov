/* eslint-disable */

const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || "";

const sendEvent = (category, action, label) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
  });
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
        open_create_account_modal: () => {
          sendEvent("landing_page_hero_get_started", "click", "open_create_account_modal");
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
        open_create_account_modal: () => {
          sendEvent("landing_page_navbar_register", "click", "open_create_account_modal");
        },
      },
    },
    landing_page_registration_create: {
      click: {
        go_to_myNJ_registration: () => {
          sendEvent("landing_page_registration_create", "click", "go_to_myNJ_registration");
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
        return_to_onboarding: () => {
          sendEvent("roadmap_profile_edit_button", "click", "return_to_onboarding");
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
    task_status_dropdown: {
      click_not_started: {
        selected_not_started_status: () => {
          sendEvent("task_status_dropdown", "click_not_started", "selected_not_started_status");
        },
      },
      click_in_progress: {
        selected_in_progress_status: () => {
          sendEvent("task_status_dropdown", "click_in_progress", "selected_in_progress_status");
        },
      },
      click_completed: {
        selected_completed_status: () => {
          sendEvent("task_status_dropdown", "click_completed", "selected_completed_status");
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
    onboarding_first_step: {
      arrive: {
        arrive_from_myNJ_registration: () => {
          sendEvent("onboarding_first_step", "arrive", "arrive_from_myNJ_registration");
        },
      },
    },
    business_formation_business_name_edit: {
      click: {
        go_to_profile_screen: () => {
          sendEvent("business_formation_business_name_edit", "click", "go_to_profile_screen");
        },
      },
    },
    business_formation_legal_structure_edit: {
      click: {
        go_to_profile_screen: () => {
          sendEvent("business_formation_legal_structure_edit", "click", "go_to_profile_screen");
        },
      },
    },
    business_formation_business_step_continue_button: {
      click: {
        go_to_next_formation_step: () => {
          sendEvent("business_formation_business_step_continue_button", "click", "go_to_next_formation_step");
        },
      },
    },
    business_formation_contacts_step_continue_button: {
      click: {
        go_to_next_formation_step: () => {
          sendEvent("business_formation_contacts_step_continue_button", "click", "go_to_next_formation_step");
        },
      },
    },
    business_formation_review_step_continue_button: {
      click: {
        go_to_next_formation_step: () => {
          sendEvent("business_formation_review_step_continue_button", "click", "go_to_next_formation_step");
        },
      },
    },
    business_formation_billing_step_continue_button: {
      click: {
        go_to_next_formation_step: () => {
          sendEvent("business_formation_billing_step_continue_button", "click", "go_to_next_formation_step");
        },
      },
    },
    business_formation_name_step_continue_button: {
      click: {
        go_to_next_formation_step: () => {
          sendEvent("business_formation_name_step_continue_button", "click", "go_to_next_formation_step");
        },
      },
    },
    business_formation_name_step_update_name_on_roadmap: {
      click: {
        update_name_on_roadmap: () => {
          sendEvent("business_formation_name_step_update_name_on_roadmap", "click", "update_name_on_roadmap");
        },
      },
    },
  },
};
