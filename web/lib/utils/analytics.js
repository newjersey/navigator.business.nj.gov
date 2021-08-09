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
      window.gtag("set", "industry_dimension", { Industry: value });
    },
    municipality: (value) => {
      window.gtag("set", "municipality_dimension", { Municipality: value });
    },
    legalStructure: (value) => {
      window.gtag("set", "legal_structure_dimension", { "Legal Structure": value });
    },
    liquorLicense: (value) => {
      window.gtag("set", "liquor_license_dimension", { "Liquor License": value });
    },
    homeBasedBusiness: (value) => {
      window.gtag("set", "home_based_business_dimension", { "Home_Based Business": value });
    },
  },

  event: {
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
  },
};
