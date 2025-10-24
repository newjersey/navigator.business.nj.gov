/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  LegacyEventAction,
  LegacyEventCategory,
  LegacyEventLabel,
} from "@/lib/utils/analytics-legacy";
import analytics from "./analytics-base";

export const GTM_ID = process.env.GOOGLE_TAG_MANAGER_ID;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Nothing {}
type Union<T, U> = T | (U & Nothing);

type EventType =
  | "account_clicks"
  | "call_to_action_clicks"
  | "contextual_link_clicks"
  | "form_edits"
  | "form_status"
  | "form_submits"
  | "form_validation"
  | "graduation_phase_interactions"
  | "link_clicks"
  | "navigation_clicks"
  | "navigator_phase_change"
  | "outbound_link_clicks"
  | "scroll_tracking"
  | "site_return_callback"
  | "task_manual_status_change"
  | "task_search_interactions"
  | "task_tab_clicked"
  | "task_tab_clicks"
  | "task_tab_continue_button_clicks"
  | "tax_calendar_arrive_v2"
  | "tax_calendar_click_v2"
  | "tax_clearance_switch_step"
  | "tax_clearance_validation_error"
  | "tax_clearance_validation_success"
  | "tool_tip_mouseover"
  | "xray_lookup_failed"
  | "xray_renewal_started_cta"
  | "xray_renewal_started_expired_card"
  | "xray_status_check_started"
  | "xray_status_check_success_active"
  | "xray_status_check_success_expired"
  | "non_essential_question_view"
  | "environmental_requirements_sbap"
  | "env_requirements_assessment_started"
  | "env_stepper_step_viewed"
  | "env_final_cta_clicked"
  | "env_question_answered"
  | "env_permits_required_displayed"
  | "env_no_permits_displayed"
  | "env_responses_edit_started"
  | "env_help_sbap_opened"
  | "env_help_dep_opened"
  | "env_help_responses_opened"
  | "env_save_progress_prompted"
  | "env_continue_without_auth"
  | "env_contact_info_engaged"
  | string;

const eventMap: Record<EventType, string> = {
  account_clicks: "account_clicks",
  call_to_action_clicks: "call_to_action_clicks",
  contextual_link_clicks: "contextual_link_clicks",
  form_edits: "form_edits",
  form_status: "form_status",
  form_submits: "form_submits",
  form_validation: "form_validation",
  graduation_phase_interactions: "graduation_phase_interactions",
  link_clicks: "link_clicks",
  navigation_clicks: "navigation_clicks",
  navigator_phase_change: "navigator_phase_change",
  outbound_link_clicks: "outbound_link_clicks",
  scroll_tracking: "scroll_tracking",
  site_return_callback: "site_return_callback",
  task_manual_status_change: "task_manual_status_change",
  task_search_interactions: "task_search_interactions",
  task_tab_clicked: "task_tab_clicked",
  task_tab_clicks: "task_tab_clicks",
  task_tab_continue_button_clicks: "task_tab_continue_button_clicks",
  tax_calendar_arrive_v2: "tax_calendar_arrive_v2",
  tax_calendar_click_v2: "tax_calendar_click_v2",
  tax_clearance_switch_step: "tax_clearance_switch_step",
  tax_clearance_validation_error: "tax_clearance_validation_error",
  tax_clearance_validation_success: "tax_clearance_validation_success",
  tool_tip_mouseover: "tool_tip_mouseover",
  xray_lookup_failed: "xray_lookup_failed",
  xray_renewal_started_cta: "xray_renewal_started_cta",
  xray_renewal_started_expired_card: "xray_renewal_started_expired_card",
  xray_status_check_started: "xray_status_check_started",
  xray_status_check_success_active: "xray_status_check_success_active",
  xray_status_check_success_expired: "xray_status_check_success_expired",
  environmental_requirements_sbap: "environmental_requirements_sbap",
  env_requirements_assessment_started: "env_requirements_assessment_started",
  env_stepper_step_viewed: "env_stepper_step_viewed",
  env_final_cta_clicked: "env_final_cta_clicked",
  env_question_answered: "env_question_answered",
  env_permits_required_displayed: "env_permits_required_displayed",
  env_no_permits_displayed: "env_no_permits_displayed",
  env_responses_edit_started: "env_responses_edit_started",
  env_help_sbap_opened: "env_help_sbap_opened",
  env_help_dep_opened: "env_help_dep_opened",
  env_help_responses_opened: "env_help_responses_opened",
  env_save_progress_prompted: "env_save_progress_prompted",
  env_continue_without_auth: "env_continue_without_auth",
  env_contact_info_engaged: "env_contact_info_engaged",
};

type ParameterType =
  | "click_text"
  | "on_task_id"
  | "clicked_to"
  | "on_page_url"
  | "status_selected"
  | "scroll_depth"
  | "legacy_event_action"
  | "legacy_event_category"
  | "legacy_event_label"
  | "on_site_section"
  | "phase"
  | "action"
  | "on_tab_name"
  | "item"
  | "clicked"
  | "form_name"
  | "server_response";

const parameterMap: Record<ParameterType, string> = {
  click_text: "click_text",
  clicked_to: "clicked_to",
  on_task_id: "on_task_id",
  on_page_url: "on_page_url",
  status_selected: "status_selected",
  on_site_section: "on_site_section",
  on_tab_name: "on_tab_name",
  scroll_depth: "scroll_depth",
  phase: "phase",
  clicked: "clicked",
  action: "action",
  item: "item",
  form_name: "form_name",
  server_response: "server_response",
  legacy_event_action: "legacy_event_action",
  legacy_event_category: "legacy_event_category",
  legacy_event_label: "legacy_event_label",
};

type Clicked =
  | "open_mobile_menu"
  | "close_mobile_menu"
  | "view_roadmap"
  | "close_contextual_sidebar"
  | "go_to_task"
  | "expand_account_menu"
  | "go_to_myNJ_home"
  | "expand_contract"
  | "go_to_profile_screen"
  | "go_to_profile_tasks_screen"
  | "go_to_myNJ_login"
  | "go_to_NavigatorAccount_setup"
  | "log_out"
  | "unlinked_myNJ_account"
  | "get_unlinked_myNJ_account_modal"
  | "link_your_myNJ_account";

type OnSiteSection =
  | "landing_page"
  | "onboarding_screen"
  | "dashboard_screen"
  | "profile_screen"
  | "generic_task_screen"
  | "generic_filing_screen"
  | "cannabis_task"
  | "dashboard_calendar_screen"
  | "business_formation_task";

type StatusSelected = "selected_not_started" | "selected_in_progress" | "selected_completed";

type Phase = "progress_to_formed_phase" | "progress_to_up_and_running_phase";

type Action =
  | "show_formation_date_modal"
  | "hide_contextual_info"
  | "formation_status_set_to_complete"
  | "show_tax_registration_date_modal"
  | "show_tax_registration_success_snackbar"
  | "go_to_myNJ_registration"
  | "go_to_filing_detail_screen"
  | "go_to_profile_screen"
  | "go_to_NavigatorAccount_setup"
  | "return_from_myNJ_registration"
  | "arrive";

type ClickText =
  | "hero_get_started"
  | "secondary_get_started"
  | "find_funding"
  | "navbar_register"
  | "close_contextual_sidebar"
  | "live_chat"
  | "show_myNJ_registration_prompt_modal"
  | "profile_save"
  | "i_already_submitted"
  | "view_requirements"
  | "need_help_with_a_problem?"
  | "share_feedback"
  | "request_new_capabilities"
  | "go_to_treasury_amendments_page";

type ScrollDepth = "how_it_works" | "more_support_seen";

type FormName =
  | "finish_onboarding"
  | "finish_additional_business_onboarding"
  | "business_formation"
  | "profile"
  | "tax_calendar"
  | "cannabis_license"
  | "industry_essential_questions"
  | "name_search"
  | "account_setup"
  | "task_address_form"
  | "xray_address_form";

type OnTabName =
  | "start_application"
  | "questions"
  | "requirements"
  | "check_status"
  | "name_step"
  | "business_step"
  | "contacts_step"
  | "billing_step"
  | "review_step"
  | "success_step"
  | "resolution_step"
  | "authorization_step";

type Item =
  | "formation_nudge_button"
  | "formation_date_modal"
  | "formation_legal_structure_modal"
  | "task_status_checkbox"
  | "tax_registration_nudge_button"
  | "tax_registration_snackbar"
  | "task_tax_registration_date_modal"
  | "myNJ_prompt_modal_complete_button"
  | "calendar_date"
  | "mobile_hamburger_icon"
  | "mobile_menu_close_button"
  | "mobile_menu"
  | "mobile_hamburger_icon_quick_links"
  | "profile_back_to_roadmap"
  | "task_back_to_roadmap"
  | "task_mini_roadmap_step"
  | "task_mini_roadmap_task"
  | "roadmap_task_title"
  | "contextual_sidebar"
  | "account_name"
  | "account_menu_myNJ_account"
  | "account_menu_my_profile"
  | "roadmap_section"
  | "roadmap_profile_edit_button"
  | "roadmap_personlize_my_tasks_button"
  | "landing_page_navbar_log_in"
  | "guest_modal"
  | "guest_menu"
  | "guest_snackbar"
  | "roadmap_logout_button"
  | "landing_page_hero_log_in"
  | "go_to_profile_nudge_button"
  | "opportunity_card"
  | "hidden_opportunities_section"
  | "link_with_myNJ"
  | "landing_page"
  | "skip_to_main_content"
  | "show_funding_opportunities"
  | "check_account_log_in"
  | "link_your_myNJ_account_link"
  | "tax_calendar_v2_cta"
  | "calendar_access_v2";

type BooleanResponseOption = "yes" | "no";

export interface Questions {
  cannabis_license_type: "annual" | "conditional";
  cannabis_business_type: "micro" | "standard";
  require_liquor_license: BooleanResponseOption;
  car_service_size: "large_size" | "taxi_size" | "both_sizes";
  moving_across_state_lines: BooleanResponseOption;
  interstate_logistics: BooleanResponseOption;
  childcare_for_six_or_more: BooleanResponseOption;
  staffing_services: BooleanResponseOption;
  registered_agent_name: "same_as_account_holder";
  registered_agent: "manual" | "agent_id";
  offer_public_accounting: BooleanResponseOption;
  real_estate_appraisal: BooleanResponseOption;
  certified_interior_designer: BooleanResponseOption;
  pet_care_housing: BooleanResponseOption;
  pet_care_sell_items: BooleanResponseOption;
  [k: string]: Union<"change" | "first_time" | "deleted", string>;
}

type ServerResponse = "success" | "error" | "found" | "not_found" | "not_authorized";

type ClickedToUnion = Union<OnTabName | URL | null, string>;

type ClickTextUnion = Union<ClickText | null, string>;

export interface GTMEventData {
  event: EventType;
  legacy_event_category?: LegacyEventCategory;
  legacy_event_action?: LegacyEventAction;
  legacy_event_label?: LegacyEventLabel;
  click_text?: ClickTextUnion;
  clicked_to?: ClickedToUnion;
  on_task_id?: string;
  on_page_url?: string;
  on_tab_name?: OnTabName;
  on_site_section?: OnSiteSection;
  status_selected?: StatusSelected;
  scroll_depth?: ScrollDepth;
  clicked?: Clicked;
  phase?: Phase;
  action?: Action;
  item?: Item;
  form_name?: FormName;
  questions?: Partial<Questions>;
  server_response?: ServerResponse;
}

const getSiteSectionFromUrl = (
  url: URL,
  calendar_view?: "NONE" | "LIST" | "FULL",
): OnSiteSection | undefined => {
  const path = url.pathname;
  if (path.includes("/onboarding")) {
    return "onboarding_screen";
  }

  if (path.includes("/dashboard")) {
    if (calendar_view === "FULL") {
      return "dashboard_calendar_screen";
    }
    return "dashboard_screen";
  }

  if (path.includes("/profile")) {
    return "profile_screen";
  }

  if (path.includes("/tasks")) {
    if (path.includes("form-business-entity")) {
      return "business_formation_task";
    }
    if (path.includes("cannabis")) {
      return "cannabis_task";
    }
    return "generic_task_screen";
  }

  if (path.includes("/filings")) {
    return "generic_filing_screen";
  }

  if (path.includes("/navigator") || path === "/") {
    return "landing_page";
  }

  return undefined;
};

class GTMTracker {
  track(data: GTMEventData): void {
    const { questions, ...dataLessQuestions } = data;

    const events = [];

    const on_site_section: OnSiteSection | undefined = getSiteSectionFromUrl(
      new URL(window.location.href),
      analytics.context.calendar_view,
    );

    const on_task_id: string | undefined = window.location.pathname.split("/tasks/")[1];

    const createEvent = (data: GTMEventData) => {
      const { event, ...parameters } = data;
      const eventName = eventMap[event];
      return Object.keys(parameters).reduce(
        (acc, key) => {
          acc[parameterMap[key as ParameterType]] = (parameters as GTMEventData)[
            key as ParameterType
          ]?.toString();
          return acc;
        },
        {
          event: "analytics_event",
          event_category: eventName,
          hostname: location.hostname,
          on_site_section,
          on_task_id,
        } as Partial<Record<string, string>>,
      );
    };

    if (questions && Object.keys(questions).length > 0) {
      for (const [key, value] of Object.entries(questions)) {
        const event = createEvent(dataLessQuestions);
        event[`question`] = key;
        event[`response`] = value;
        events.push(event);
      }
    } else {
      events.push(createEvent(dataLessQuestions));
    }

    events.map((event) => {
      analytics.sendEvent(event);
    });
  }
}

const eventRunner = new GTMTracker();

interface GTMUserData {
  user_id?: string;
  industry_name?: string;
  municipality_name?: string;
  legal_structure?: string;
  home_based_business?: boolean;
  persona?: string;
  current_registration_status?: string;
  ab_experience?: string;
  naics_code?: string;
  current_phase?: string | null;
  sub_persona?: string;
}

export class DimensionQueueFactory {
  private internalQueue;
  private updateFunction: (userData: GTMUserData) => void;

  constructor(update: (userData: GTMUserData) => void) {
    this.internalQueue = {};
    this.updateFunction = update;
  }

  queue(userData: Partial<GTMUserData>) {
    this.internalQueue = {
      ...this.internalQueue,
      ...userData,
    };
    return this;
  }

  userId(user_id?: string) {
    return this.queue({ user_id });
  }

  industry(industry_name?: string) {
    return this.queue({ industry_name });
  }

  municipality(municipality_name?: string) {
    return this.queue({ municipality_name });
  }

  legalStructure(legal_structure?: string) {
    return this.queue({ legal_structure });
  }

  homeBasedBusiness(home_based_business?: boolean) {
    return this.queue({ home_based_business });
  }

  persona(persona?: string) {
    return this.queue({ persona });
  }

  registrationStatus(current_registration_status?: string) {
    return this.queue({ current_registration_status });
  }

  abExperience(ab_experience?: string) {
    return this.queue({ ab_experience });
  }

  naicsCode(naics_code: string) {
    return this.queue({ naics_code: naics_code.length > 0 ? naics_code : undefined });
  }

  phase(current_phase: string | null, calendar_view: "NONE" | "LIST" | "FULL") {
    analytics.updateContext({ calendar_view });
    return this.queue({ current_phase });
  }

  subPersona(sub_persona?: string) {
    return this.queue({ sub_persona });
  }

  update(): void {
    return this.updateFunction(this.internalQueue);
  }

  current(): GTMUserData {
    return this.internalQueue;
  }
}

const dimensionRunner = new DimensionQueueFactory(analytics.userUpdate);

export default {
  eventRunner,
  pageview: (path: string, name?: string, section_name?: string) => {
    const page_name = document.title;
    analytics.sendEvent({
      event: "screen_view",
      page_name: page_name,
      page_path: path,
      hostname: window.location.hostname,
      section_name: section_name,
    });
  },
  dimensions: dimensionRunner,
  event: {
    landing_page: {
      arrive: {
        get_unlinked_myNJ_account: () => {
          eventRunner.track({
            legacy_event_action: "arrive",
            legacy_event_category: "landing_page",
            legacy_event_label: "get_unlinked_myNJ_account",
            event: "navigation_clicks",
            item: "link_with_myNJ",
          });
        },
      },
    },
    landing_page_hero_log_in: {
      click: {
        go_to_myNJ_login: () => {
          eventRunner.track({
            event: "account_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_hero_log_in",
            legacy_event_label: "go_to_myNJ_login",
            clicked: "go_to_myNJ_login",
            item: "landing_page_hero_log_in",
          });
        },
      },
    },
    landing_page_hero_get_started: {
      click: {
        go_to_onboarding: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_hero_get_started",
            legacy_event_label: "go_to_onboarding",
            click_text: "hero_get_started",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    landing_page_get_my_registration_guide_tile: {
      click: {
        go_to_onboarding: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_get_my_registration_guide_tile",
            legacy_event_label: "go_to_onboarding",
            click_text: "get_my_registration_guide_tile",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    landing_page_file_and_pay_my_taxes_tile: {
      click: {
        go_to_onboarding: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_file_and_pay_my_taxes_tile",
            legacy_event_label: "go_to_onboarding",
            click_text: "file_and_pay_my_taxes_tile",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    landing_page_im_an_out_of_business_tile: {
      click: {
        go_to_onboarding: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_im_an_out_of_business_tile",
            legacy_event_label: "go_to_onboarding",
            click_text: "im_an_out_of_business_tile",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    landing_page_find_funding_for_my_business_tile: {
      click: {
        go_to_onboarding: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_find_funding_for_my_business_tile",
            legacy_event_label: "go_to_onboarding",
            click_text: "find_funding_for_my_business_tile",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    landing_page_im_starting_a_nj_business_tile: {
      click: {
        go_to_onboarding: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_im_starting_a_nj_business_tile",
            legacy_event_label: "go_to_onboarding",
            click_text: "im_starting_a_nj_business_tile",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    landing_page_im_running_a_nj_business_tile: {
      click: {
        go_to_onboarding: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_im_running_a_nj_business_tile",
            legacy_event_label: "go_to_onboarding",
            click_text: "im_running_a_nj_business_tile",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    landing_page_navbar_log_in: {
      click: {
        go_to_myNJ_login: () => {
          eventRunner.track({
            event: "account_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_navbar_log_in",
            legacy_event_label: "go_to_myNJ_login",
            clicked: "go_to_myNJ_login",
            item: "landing_page_navbar_log_in",
          });
        },
      },
    },
    landing_page_navbar_register: {
      click: {
        go_to_onboarding: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_navbar_register",
            legacy_event_label: "go_to_onboarding",
            click_text: "navbar_register",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    // update all these events with the legacy_event* fields

    landing_page_second_get_started: {
      click: {
        go_to_onboarding: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_second_get_started",
            legacy_event_label: "go_to_onboarding",
            click_text: "secondary_get_started",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    landing_page_find_funding: {
      click: {
        go_to_onboarding: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "landing_page_find_funding",
            legacy_event_label: "go_to_onboarding",
            click_text: "find_funding",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    guest_snackbar: {
      click: {
        go_to_NavigatorAccount_setup: () => {
          eventRunner.track({
            event: "account_clicks",
            legacy_event_action: "click",
            legacy_event_category: "guest_snackbar",
            legacy_event_label: "go_to_NavigatorAccount_setup",
            clicked: "go_to_NavigatorAccount_setup",
            item: "guest_snackbar",
          });
        },
      },
    },
    guest_modal: {
      click: {
        go_to_NavigatorAccount_setup: () => {
          eventRunner.track({
            event: "account_clicks",
            legacy_event_action: "click",
            legacy_event_category: "guest_modal",
            legacy_event_label: "go_to_NavigatorAccount_setup",
            clicked: "go_to_NavigatorAccount_setup",
            item: "guest_modal",
          });
        },
        go_to_myNJ_login: () => {
          eventRunner.track({
            event: "account_clicks",
            legacy_event_action: "click",
            legacy_event_category: "guest_modal",
            legacy_event_label: "go_to_myNJ_login",
            clicked: "go_to_myNJ_login",
            item: "guest_modal",
          });
        },
      },
    },
    guest_menu: {
      click: {
        go_to_NavigatorAccount_setup: () => {
          eventRunner.track({
            event: "account_clicks",
            legacy_event_action: "click",
            legacy_event_category: "guest_menu",
            legacy_event_label: "go_to_NavigatorAccount_setup",
            clicked: "go_to_NavigatorAccount_setup",
            item: "guest_menu",
          });
        },
        go_to_myNJ_login: () => {
          eventRunner.track({
            event: "account_clicks",
            legacy_event_action: "click",

            legacy_event_category: "guest_menu",
            legacy_event_label: "go_to_myNJ_login",
            clicked: "go_to_myNJ_login",
            item: "guest_menu",
          });
        },
      },
    },
    roadmap_dashboard: {
      arrive: {
        arrive_from_myNJ_registration: () => {
          eventRunner.track({
            event: "site_return_callback",
            legacy_event_action: "arrive",
            legacy_event_category: "roadmap_dashboard",
            legacy_event_label: "arrive_from_myNJ_registration",
            action: "return_from_myNJ_registration",
          });
        },
        progress_to_formed_phase: () => {
          eventRunner.track({
            event: "navigator_phase_change",
            legacy_event_action: "arrive",
            legacy_event_category: "roadmap_dashboard",
            legacy_event_label: "progress_to_formed_phase",
            phase: "progress_to_formed_phase",
          });
        },
        progress_to_up_and_running_phase: () => {
          eventRunner.track({
            event: "navigator_phase_change",
            legacy_event_action: "arrive",
            legacy_event_category: "roadmap_dashboard",
            legacy_event_label: "progress_to_up_and_running_phase",
            phase: "progress_to_up_and_running_phase",
          });
        },
      },
    },
    roadmap_task_title: {
      click: {
        go_to_task: (task_id: string) => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "roadmap_task_title",
            legacy_event_label: "go_to_task",
            clicked: "go_to_task",
            clicked_to: task_id,
          });
        },
      },
    },
    roadmap_logout_button: {
      click: {
        log_out: () => {
          eventRunner.track({
            event: "account_clicks",
            legacy_event_action: "click",
            legacy_event_category: "roadmap_logout_button",
            legacy_event_label: "log_out",
            clicked: "log_out",
            item: "roadmap_logout_button",
          });
        },
      },
    },
    roadmap_profile_edit_button: {
      click: {
        go_to_profile_screen: () => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "roadmap_profile_edit_button",
            legacy_event_label: "go_to_profile_screen",
            clicked: "go_to_profile_screen",
          });
        },
      },
    },
    roadmap_personlize_my_tasks_button: {
      click: {
        go_to_profile_tasks_screen: () => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "roadmap_profile_edit_button",
            legacy_event_label: "go_to_profile_screen",
            clicked: "go_to_profile_tasks_screen",
          });
        },
      },
    },
    roadmap_footer_live_chat_link: {
      click: {
        open_live_chat: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "roadmap_footer_live_chat_link",
            legacy_event_label: "open_live_chat",
            click_text: "roadmap_footer_live_chat_link",
            clicked_to: "live_chat",
          });
        },
      },
    },
    roadmap_section: {
      click: {
        expand_contract: () => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "roadmap_section",
            legacy_event_label: "expand_contract",
            clicked: "expand_contract",
            item: "roadmap_section",
          });
        },
      },
    },
    profile_save: {
      click: {
        save_profile_changes: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "profile_save",
            legacy_event_label: "save_profile_changes",
            click_text: "profile_save",
          });
        },
      },
    },
    profile_back_to_roadmap: {
      click: {
        view_roadmap: () => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "profile_back_to_roadmap",
            legacy_event_label: "view_roadmap",
            clicked: "view_roadmap",
            item: "profile_back_to_roadmap",
          });
        },
      },
    },
    task_back_to_roadmap: {
      click: {
        view_roadmap: () => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "task_back_to_roadmap",
            legacy_event_label: "view_roadmap",
            clicked: "view_roadmap",
            item: "task_back_to_roadmap",
          });
        },
      },
    },
    task_mini_roadmap_step: {
      click: {
        expand_contract: () => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "task_mini_roadmap_step",
            legacy_event_label: "expand_contract",
            clicked: "expand_contract",
            item: "task_mini_roadmap_step",
          });
        },
      },
    },
    task_mini_roadmap_task: {
      click: {
        go_to_task: (task_id: string) => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "task_mini_roadmap_task",
            legacy_event_label: "go_to_task",
            clicked_to: task_id,
            item: "task_mini_roadmap_task",
          });
        },
      },
    },
    task_primary_call_to_action: {
      click: {
        open_external_website: (
          click_text: string,
          clicked_to: URL | string,
          on_tab_name?: OnTabName,
        ) => {
          eventRunner.track({
            event: "call_to_action_clicks",
            legacy_event_action: "click",
            legacy_event_category: "task_primary_call_to_action",
            legacy_event_label: "open_external_website",
            click_text: click_text as ClickText | undefined,
            clicked_to,
            on_tab_name,
          });
        },
      },
    },
    task_tab_start_application: {
      click: {
        view_application_tab: () => {
          eventRunner.track({
            event: "task_tab_clicks",
            legacy_event_action: "click",
            legacy_event_category: "task_tab_start_application",
            legacy_event_label: "view_application_tab",
            on_tab_name: "start_application",
          });
        },
      },
    },
    task_tab_check_status: {
      click: {
        view_status_tab: () => {
          eventRunner.track({
            event: "task_tab_clicks",
            legacy_event_action: "click",
            legacy_event_category: "task_tab_check_status",
            legacy_event_label: "view_status_tab",
            on_tab_name: "check_status",
          });
        },
      },
    },
    task_button_i_already_submitted: {
      click: {
        view_status_tab: (clicked_to?: ClickedToUnion, on_tab_name?: OnTabName) => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "task_button_i_already_submitted",
            legacy_event_label: "view_status_tab",
            click_text: "i_already_submitted",
            clicked_to,
            on_tab_name,
          });
        },
      },
    },
    task_address_form: {
      submit: {
        submitted_address_form: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "task_address_form",
            legacy_event_label: "submitted_address_form",
            form_name: "task_address_form",
          });
        },
      },
      response: {
        fail_application_not_found: () => {
          eventRunner.track({
            event: "form_status",
            legacy_event_action: "response",
            legacy_event_category: "task_address_form",
            legacy_event_label: "fail_application_not_found",
            form_name: "task_address_form",
            server_response: "not_found",
          });
        },
        success_application_found: () => {
          eventRunner.track({
            event: "form_status",
            legacy_event_action: "response",
            legacy_event_category: "task_address_form",
            legacy_event_label: "success_application_found",
            form_name: "task_address_form",
            server_response: "found",
          });
        },
      },
    },
    task_status_checklist_edit_button: {
      click: {
        edit_address_form: () => {
          eventRunner.track({
            event: "form_edits",
            legacy_event_action: "click",
            legacy_event_category: "task_status_checklist_edit_button",
            legacy_event_label: "edit_address_form",
            form_name: "task_address_form",
          });
        },
      },
    },
    task_status_checkbox: {
      click: {
        selected_to_do_status: () => {
          eventRunner.track({
            event: "task_manual_status_change",
            legacy_event_action: "click",
            legacy_event_category: "task_status_checkbox",
            legacy_event_label: "selected_not_started_status",
            status_selected: "selected_not_started",
          });
        },
        selected_completed_status: () => {
          eventRunner.track({
            event: "task_manual_status_change",
            legacy_event_action: "click",
            legacy_event_category: "task_status_checkbox",
            legacy_event_label: "selected_completed_status",
            status_selected: "selected_completed",
          });
        },
      },
      click_completed: {
        show_formation_date_modal: () => {
          eventRunner.track({
            event: "graduation_phase_interactions",
            action: "show_formation_date_modal",
            legacy_event_action: "click",
            legacy_event_category: "task_status_checkbox",
            legacy_event_label: "show_formation_date_modal",
            item: "task_status_checkbox",
          });
        },
        show_tax_registration_date_modal: () => {
          eventRunner.track({
            event: "graduation_phase_interactions",
            legacy_event_action: "click",
            legacy_event_category: "task_status_checkbox",
            legacy_event_label: "show_tax_registration_date_modal",
            item: "task_status_checkbox",
          });
        },
      },
    },
    formation_date_modal: {
      submit: {
        formation_status_set_to_complete: () => {
          eventRunner.track({
            event: "graduation_phase_interactions",
            legacy_event_action: "submit",
            legacy_event_category: "formation_date_modal",
            legacy_event_label: "formation_status_set_to_complete",
            action: "show_formation_date_modal",
            item: "task_status_checkbox",
          });
        },
      },
    },
    contextual_link: {
      click: {
        view_sidebar: (clicked_to: string, click_text: string, on_tab_name?: OnTabName) => {
          eventRunner.track({
            event: "contextual_link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "contextual_link",
            legacy_event_label: "view_sidebar",
            clicked_to,
            click_text: click_text as ClickText,
            on_tab_name,
          });
        },
      },
    },
    tooltip: {
      mouseover: {
        view_tooltip: () => {
          eventRunner.track({
            legacy_event_action: "mouseover",
            legacy_event_category: "tooltip",
            legacy_event_label: "view_tooltip",
            event: "tool_tip_mouseover",
          });
        },
      },
    },
    external_link: {
      click: {
        open_external_website: (click_text?: string, clicked_to?: string) => {
          eventRunner.track({
            event: "outbound_link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "external_link",
            legacy_event_label: "open_external_website",
            click_text: click_text as ClickText | undefined,
            clicked_to,
          });
        },
      },
    },
    contextual_sidebar: {
      click_outside: {
        close_contextual_sidebar: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click_outside",
            legacy_event_category: "contextual_sidebar",
            legacy_event_label: "close_contextual_sidebar",
            item: "contextual_sidebar",
            click_text: null,
            clicked_to: null,
          });
        },
      },
    },
    contextual_sidebar_close_button: {
      click: {
        close_contextual_sidebar: () => {
          eventRunner.track({
            event: "link_clicks",
            item: "contextual_sidebar",
            legacy_event_action: "click",
            legacy_event_category: "contextual_sidebar_close_button",
            legacy_event_label: "close_contextual_sidebar",
            click_text: "close_contextual_sidebar",
            clicked_to: null,
          });
        },
      },
    },
    mobile_hamburger_icon: {
      click: {
        open_mobile_menu: () => {
          eventRunner.track({
            event: "navigation_clicks",
            item: "mobile_hamburger_icon",
            legacy_event_action: "click",
            legacy_event_category: "mobile_hamburger_icon",
            legacy_event_label: "open_mobile_menu",
            clicked: "open_mobile_menu",
          });
        },
      },
    },
    mobile_menu_close_button: {
      click: {
        close_mobile_menu: () => {
          eventRunner.track({
            event: "navigation_clicks",
            item: "mobile_hamburger_icon",
            legacy_event_action: "click",
            legacy_event_category: "mobile_menu_close_button",
            legacy_event_label: "close_mobile_menu",
            clicked: "close_mobile_menu",
          });
        },
      },
    },
    mobile_menu: {
      click_outside: {
        close_mobile_menu: () => {
          eventRunner.track({
            event: "navigation_clicks",
            item: "mobile_hamburger_icon",
            legacy_event_action: "click_outside",
            legacy_event_category: "mobile_menu",
            legacy_event_label: "close_mobile_menu",
            clicked: "close_mobile_menu",
          });
        },
      },
    },
    mobile_hamburger_icon_quick_links: {
      click: {
        open_mobile_menu: () => {
          eventRunner.track({
            event: "navigation_clicks",
            item: "mobile_hamburger_icon_quick_links",
            legacy_event_action: "click",
            legacy_event_category: "mobile_hamburger_icon_quick_links",
            legacy_event_label: "open_mobile_menu",
            clicked: "open_mobile_menu",
          });
        },
      },
    },
    mobile_menu_close_button_quick_links: {
      click: {
        close_mobile_menu: () => {
          eventRunner.track({
            event: "navigation_clicks",
            item: "mobile_hamburger_icon_quick_links",
            legacy_event_action: "click",
            legacy_event_category: "mobile_menu_close_button_quick_links",
            legacy_event_label: "close_mobile_menu",
            clicked: "close_mobile_menu",
          });
        },
      },
    },
    mobile_menu_quick_links: {
      click_outside: {
        close_mobile_menu: () => {
          eventRunner.track({
            event: "navigation_clicks",
            item: "mobile_hamburger_icon_quick_links",
            legacy_event_action: "click_outside",
            legacy_event_category: "mobile_menu_quick_links",
            legacy_event_label: "close_mobile_menu",
            clicked: "close_mobile_menu",
          });
        },
      },
    },
    mobile_hamburger_quick_links_plan: {
      click: {
        plan_page: () => {
          eventRunner.track({
            legacy_event_category: "mobile_hamburger_quick_links_plan",
            legacy_event_action: "click",
            legacy_event_label: "go_to_plan_page",
            event: "navigation_clicks",
            clicked_to: "plan_page",
          });
        },
      },
    },
    mobile_hamburger_quick_links_start: {
      click: {
        start_page: () => {
          eventRunner.track({
            legacy_event_category: "mobile_hamburger_quick_links_start",
            legacy_event_action: "click",
            legacy_event_label: "go_to_start_page",
            event: "navigation_clicks",
            clicked_to: "start_page",
          });
        },
      },
    },
    mobile_hamburger_quick_links_grow: {
      click: {
        grow_page: () => {
          eventRunner.track({
            legacy_event_category: "mobile_hamburger_quick_links_grow",
            legacy_event_action: "click",
            legacy_event_label: "go_to_grow_page",
            event: "navigation_clicks",
            clicked_to: "grow_page",
          });
        },
      },
    },
    mobile_hamburger_quick_links_updates: {
      click: {
        updates_page: () => {
          eventRunner.track({
            legacy_event_category: "mobile_hamburger_quick_links_updates",
            legacy_event_action: "click",
            legacy_event_label: "go_to_update_page",
            event: "navigation_clicks",
            clicked_to: "update_page",
          });
        },
      },
    },

    mobile_hamburger_quick_links_search: {
      click: {
        search_page: () => {
          eventRunner.track({
            legacy_event_category: "mobile_hamburger_quick_links_search",
            legacy_event_action: "click",
            legacy_event_label: "go_to_search_page",
            event: "navigation_clicks",
            clicked_to: "update_search",
          });
        },
      },
    },
    mobile_hamburger_quick_links_operate: {
      click: {
        operate_page: () => {
          eventRunner.track({
            legacy_event_category: "mobile_hamburger_quick_links_operate",
            legacy_event_action: "click",
            legacy_event_label: "go_to_operate_page",
            event: "navigation_clicks",
            clicked_to: "update_operate",
          });
        },
      },
    },

    task_business_name_check_availability: {
      submit: {
        view_business_name_availability: () => {
          eventRunner.track({
            event: "form_submits",
            on_tab_name: "name_step",
            legacy_event_action: "submit",
            legacy_event_category: "task_business_name_check_availability",
            legacy_event_label: "view_business_name_availability",
            form_name: "name_search",
          });
        },
      },
    },
    task_elevator_registration: {
      click: {
        elevator_registration_button_click_register: () => {
          eventRunner.track({
            event: "outbound_link_clicks",
            legacy_event_category: "elevator_registration_button_click_register",
            legacy_event_action: "click",
          });
        },
        elevator_registration_button_click_update: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_category: "elevator_registration_button_click_update",
            legacy_event_action: "click",
          });
        },
        check_my_elevator_application_status_tab_click: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_category: "check_my_elevator_application_status_tab_click",
            legacy_event_action: "click",
          });
        },
        view_my_violation_note_button_click: () => {
          eventRunner.track({
            event: "outbound_link_clicks",
            legacy_event_category: "view_my_violation_note_button_click",
            legacy_event_action: "click",
          });
        },
      },
      submit: {
        elevator_registration_form_submission: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_category: "elevator_registration_form_submission",
            legacy_event_action: "submit",
          });
        },
        elevator_registration_form_submission_failed: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_category: "elevator_registration_form_submission_failed",
            legacy_event_action: "submit",
          });
        },
      },
    },
    account_menu_my_profile: {
      click: {
        go_to_profile_screen: () => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "account_menu_my_profile",
            legacy_event_label: "go_to_profile_screen",
            item: "account_menu_my_profile",
            clicked: "go_to_profile_screen",
          });
        },
      },
    },
    account_menu_myNJ_account: {
      click: {
        go_to_myNJ_home: () => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "account_menu_myNJ_account",
            legacy_event_label: "go_to_myNJ_home",
            item: "account_menu_myNJ_account",
            clicked: "go_to_myNJ_home",
          });
        },
      },
    },
    account_name: {
      click: {
        expand_account_menu: () => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "account_name",
            legacy_event_label: "expand_account_menu",
            item: "account_name",
            clicked: "expand_account_menu",
          });
        },
      },
    },
    onboarding_last_step: {
      submit: {
        finish_onboarding: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "onboarding_last_step",
            legacy_event_label: "finish_onboarding",
            form_name: "finish_onboarding",
          });
        },
      },
    },
    onboarding_last_step_save_additional_business_button: {
      click: {
        finish_additional_business_onboarding: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "click",
            legacy_event_category: "onboarding_last_step_save_additional_business_button",
            legacy_event_label: "finish_additional_business_onboarding",
            form_name: "finish_additional_business_onboarding",
          });
        },
      },
    },
    business_formation: {
      submit: {
        go_to_NIC_formation_processing: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation",
            legacy_event_label: "go_to_NIC_formation_processing",
            form_name: "business_formation",
            on_tab_name: "review_step",
          });
        },
        error_remain_at_formation: () => {
          eventRunner.track({
            event: "form_validation",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation",
            legacy_event_label: "error_remain_at_formation",
            form_name: "business_formation",
            on_tab_name: "review_step",
          });
        },
      },
    },
    business_formation_success_screen: {
      arrive: {
        arrive_from_NIC_formation_processing: () => {
          eventRunner.track({
            event: "site_return_callback",
            legacy_event_action: "arrive",
            legacy_event_category: "business_formation_success_screen",
            legacy_event_label: "arrive_from_NIC_formation_processing",
            form_name: "business_formation",
          });
        },
      },
    },
    business_formation_search_existing_name_again: {
      click: {
        refresh_name_search_field: () => {
          eventRunner.track({
            event: "task_search_interactions",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_search_existing_name_again",
            legacy_event_label: "refresh_name_search_field",
            on_tab_name: "name_step",
          });
        },
      },
    },
    business_formation_dba_name_search_field: {
      appears: {
        dba_name_search_field_appears: () => {
          eventRunner.track({
            event: "task_search_interactions",
            legacy_event_action: "appears",
            legacy_event_category: "business_formation_dba_name_search_field",
            legacy_event_label: "dba_name_search_field_appears",

            on_tab_name: "name_step",
          });
        },
      },
    },
    business_formation_dba_resolution_tab: {
      click: {
        arrive_on_business_formation_dba_resolution_step: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_dba_resolution_tab",
            legacy_event_label: "arrive_on_business_formation_dba_resolution_step",
            on_tab_name: "resolution_step",
          });
        },
      },
    },
    business_formation_dba_authorization_tab: {
      click: {
        arrive_on_business_formation_dba_authorization_step: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_dba_authorization_tab",
            legacy_event_label: "arrive_on_business_formation_dba_authorization_step",
            on_tab_name: "authorization_step",
          });
        },
      },
    },
    business_formation_dba_resolution_step_continue_button: {
      click: {
        arrive_on_business_formation_dba_resolution_step: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_dba_resolution_step_continue_button",
            legacy_event_label: "arrive_on_business_formation_dba_resolution_step",
            on_tab_name: "resolution_step",
          });
        },
      },
    },
    business_formation_dba_authorization_step_continue_button: {
      click: {
        arrive_on_business_formation_dba_authorization_step: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_dba_authorization_step_continue_button",
            legacy_event_label: "arrive_on_business_formation_dba_authorization_step",
            on_tab_name: "authorization_step",
          });
        },
      },
    },
    business_formation_business_name_edit: {
      click: {
        go_to_name_search_step: () => {
          eventRunner.track({
            event: "form_edits",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_business_name_edit",
            legacy_event_label: "go_to_name_search_step",
            on_tab_name: "business_step",
            form_name: "business_formation",
            click_text: "edit",
            clicked_to: "name_step",
          });
        },
      },
    },
    business_formation_legal_structure_edit: {
      click: {
        show_legal_structure_modal: () => {
          eventRunner.track({
            event: "form_edits",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_legal_structure_edit",
            legacy_event_label: "show_legal_structure_modal",
            on_tab_name: "business_step",
            form_name: "business_formation",
            click_text: "edit",
            clicked_to: "formation_legal_structure_modal",
          });
        },
      },
    },
    business_formation_legal_structure_modal: {
      submit: {
        go_to_profile_screen: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation_legal_structure_modal",
            legacy_event_label: "go_to_profile_screen",
            on_tab_name: "business_step",
            item: "formation_legal_structure_modal",
            clicked: "go_to_profile_screen",
          });
        },
      },
    },
    business_formation_name_step: {
      arrive: {
        arrive_on_business_formation_name_step: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_action: "arrive",
            legacy_event_category: "business_formation_name_step",
            legacy_event_label: "arrive_on_business_formation_name_step",
            on_tab_name: "name_step",
          });
        },
      },
    },
    business_formation_name_step_continue_button: {
      click: {
        arrive_on_business_formation_business_step: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_name_step_continue_button",
            legacy_event_label: "arrive_on_business_formation_business_step",
            on_tab_name: "name_step",
            clicked_to: "business_step",
          });
        },
      },
    },
    formation_task_name_reservation_yes_option: {
      click: {
        show_additional_options: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_action: "click",
            legacy_event_category: "formation_task_name_reservation_yes_option",
            legacy_event_label: "show_additional_options",
          });
        },
      },
    },
    formation_task_name_reservation_different_name_option: {
      click: {
        continue_formation_task: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_action: "click",
            legacy_event_category: "formation_task_name_reservation_different_name_option",
            legacy_event_label: "continue_formation_task",
          });
        },
      },
    },
    formation_task_name_reservation_keep_reservation_option: {
      click: {
        instruct_close_formation_task: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_action: "click",
            legacy_event_category: "formation_task_name_reservation_keep_reservation_option",
            legacy_event_label: "instruct_close_formation_task",
          });
        },
      },
    },
    formation_task_name_reservation_cancel_reservation_option: {
      click: {
        continue_formation_task: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_action: "click",
            legacy_event_category: "formation_task_name_reservation_cancel_reservation_option",
            legacy_event_label: "continue_formation_task",
          });
        },
      },
    },
    business_formation_business_step_continue_button: {
      click: {
        arrive_on_business_formation_contacts_step: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_business_step_continue_button",
            legacy_event_label: "arrive_on_business_formation_contacts_step",
            on_tab_name: "business_step",
            clicked_to: "contacts_step",
          });
        },
      },
    },
    business_formation_contacts_step_continue_button: {
      click: {
        arrive_on_business_formation_billing_step: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_contacts_step_continue_button",
            legacy_event_label: "arrive_on_business_formation_billing_step",
            on_tab_name: "contacts_step",
            clicked_to: "billing_step",
          });
        },
      },
    },
    business_formation_billing_step_continue_button: {
      click: {
        arrive_on_business_formation_review_step: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_billing_step_continue_button",
            legacy_event_label: "arrive_on_business_formation_review_step",
            on_tab_name: "billing_step",
            clicked_to: "review_step",
          });
        },
      },
    },
    business_formation_registered_agent_identification: {
      submit: {
        entered_agent_ID: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation_registered_agent_identification",
            legacy_event_label: "entered_agent_ID",
            on_tab_name: "contacts_step",
            form_name: "business_formation",
            questions: { registered_agent: "agent_id" },
          });
        },
        identified_agent_manually: () => {
          eventRunner.track({
            event: "form_submits",
            on_tab_name: "contacts_step",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation_registered_agent_identification",
            legacy_event_label: "identified_agent_manually",
            form_name: "business_formation",
            questions: { registered_agent: "manual" },
          });
        },
      },
    },
    business_formation_registered_agent_manual_name: {
      submit: {
        name_is_same_as_account_holder: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation_registered_agent_manual_name",
            legacy_event_label: "name_is_same_as_account_holder",
            on_tab_name: "contacts_step",
            form_name: "business_formation",
            questions: { registered_agent_name: "same_as_account_holder" },
          });
        },
      },
    },
    business_formation_registered_agent_manual_address: {
      submit: {
        address_is_same_as_account_holder: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation_registered_agent_manual_address",
            legacy_event_label: "address_is_same_as_account_holder",
            on_tab_name: "contacts_step",
            form_name: "business_formation",
            questions: { registered_agent_address: "same_as_account_holder" },
          });
        },
      },
    },
    business_formation_members: {
      submit: {
        members_submitted_with_formation: (number: number) => {
          eventRunner.track({
            event: "form_submits",
            on_tab_name: "contacts_step",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation_members",
            legacy_event_label: "members_submitted_with_formation",
            form_name: "business_formation",
            questions: { members: number.toString() },
          });
        },
      },
    },
    business_formation_signers: {
      submit: {
        signers_submitted_with_formation: (number: number) => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation_signers",
            legacy_event_label: "signers_submitted_with_formation",
            on_tab_name: "contacts_step",
            form_name: "business_formation",
            questions: { signers: number.toString() },
          });
        },
      },
    },
    business_formation_provisions: {
      submit: {
        provisions_submitted_with_formation: (number: number) => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation_provisions",
            legacy_event_label: "provisions_submitted_with_formation",
            on_tab_name: "business_step",
            form_name: "business_formation",
            questions: { provisions: number.toString() },
          });
        },
      },
    },
    business_formation_purpose: {
      submit: {
        purpose_submitted_with_formation: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation_purpose",
            legacy_event_label: "purpose_submitted_with_formation",
            on_tab_name: "business_step",
            form_name: "business_formation",
            questions: { business_purpose: "changed" },
          });
        },
      },
    },
    business_formation_name_tab: {
      click: {
        arrive_on_business_formation_name_step: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_name_tab",
            legacy_event_label: "arrive_on_business_formation_name_step",
            on_tab_name: "name_step",
          });
        },
      },
    },
    business_formation_business_tab: {
      click: {
        arrive_on_business_formation_business_step: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_business_tab",
            legacy_event_label: "arrive_on_business_formation_business_step",
            on_tab_name: "business_step",
          });
        },
      },
    },
    business_formation_contacts_tab: {
      click: {
        arrive_on_business_formation_contacts_step: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_contacts_tab",
            legacy_event_label: "arrive_on_business_formation_contacts_step",
            on_tab_name: "contacts_step",
          });
        },
      },
    },
    business_formation_billing_tab: {
      click: {
        arrive_on_business_formation_billing_step: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_billing_tab",
            legacy_event_label: "arrive_on_business_formation_billing_step",
            on_tab_name: "billing_step",
          });
        },
      },
    },
    business_formation_review_tab: {
      click: {
        arrive_on_business_formation_review_step: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_review_tab",
            legacy_event_label: "arrive_on_business_formation_review_step",
            on_tab_name: "review_step",
          });
        },
      },
    },
    emergency_trip_permit_help_button: {
      click: {
        open_live_chat: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "emergency_trip_permit_help_button",
            legacy_event_label: "open_live_chat",
            click_text: "emergency_trip_permit_help_button",
            clicked_to: "open_live_chat",
          });
        },
      },
    },
    cannabis_license_form_microbusiness_question: {
      submit: {
        yes_I_m_a_microbusiness: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "cannabis_license_form_microbusiness_question",
            legacy_event_label: "yes_I_m_a_microbusiness",
            form_name: "cannabis_license",
            questions: { cannabis_business_type: "micro" },
          });
        },
        no_I_m_a_standard_business: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "cannabis_license_form_microbusiness_question",
            legacy_event_label: "no_I_m_a_standard_business",
            form_name: "cannabis_license",
            questions: { cannabis_business_type: "standard" },
          });
        },
      },
    },
    cannabis_license_form: {
      click: {
        view_requirements: (on_tab_name: OnTabName) => {
          eventRunner.track({
            event: "task_tab_clicks",
            legacy_event_action: "click",
            legacy_event_category: "cannabis_license_form",
            legacy_event_label: "view_requirements",
            on_tab_name,
          });
        },
      },
    },
    cannabis_license_form_priority_status_diversity_checkbox: {
      submit: {
        diversely_owned_business: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "cannabis_license_form_priority_status_diversity_checkbox",
            legacy_event_label: "diversely_owned_business",
            form_name: "cannabis_license",
            questions: { priority_status: "diversely_owned_business" },
          });
        },
      },
    },
    cannabis_license_form_priority_status_impact_checkbox: {
      submit: {
        impact_zone_business: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "cannabis_license_form_priority_status_impact_checkbox",
            legacy_event_label: "impact_zone_business",
            form_name: "cannabis_license",
            questions: { priority_status: "impact_zone_business" },
          });
        },
      },
    },
    cannabis_license_form_priority_status_social_equity_checkbox: {
      submit: {
        social_equity_business: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "cannabis_license_form_priority_status_social_equity_checkbox",
            legacy_event_label: "social_equity_business",
            form_name: "cannabis_license",
            questions: { priority_status: "social_equity_business" },
          });
        },
      },
    },
    calendar_date: {
      click: {
        go_to_date_detail_screen: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "calendar_date",
            legacy_event_label: "go_to_date_detail_screen",
            action: "go_to_filing_detail_screen",
            item: "calendar_date",
          });
        },
      },
    },
    cigarette_license: {
      click: {
        switch_to_step_one: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_category: "cigarette_license_switch_to_step_1",
            legacy_event_action: "click",
            legacy_event_label: "go_to_cigarette_step_one",
          });
        },
        switch_to_step_two: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_category: "cigarette_license_switch_to_step_2",
            legacy_event_action: "click",
            legacy_event_label: "go_to_cigarette_step_two",
          });
        },
        switch_to_step_three: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_category: "cigarette_license_switch_to_step_3",
            legacy_event_action: "click",
            legacy_event_label: "go_to_cigarette_step_three",
          });
        },
        switch_to_step_four: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_category: "cigarette_license_switch_to_step_4",
            legacy_event_action: "click",
            legacy_event_label: "go_to_cigarette_step_four",
          });
        },
        step_one_continue_button: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_category: "cigarette_license_task_step_1_continue_button",
            legacy_event_action: "click",
            legacy_event_label: "go_to_cigarette_step_two",
          });
        },
        step_two_continue_button: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_category: "cigarette_license_task_step_2_continue_button",
            legacy_event_action: "click",
            legacy_event_label: "go_to_cigarette_step_three",
          });
        },
        step_three_continue_button: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_category: "cigarette_license_task_step_3_continue_button",
            legacy_event_action: "click",
            legacy_event_label: "go_to_cigarette_step_four",
          });
        },
        step_four_submit_button: () => {
          eventRunner.track({
            event: "task_tab_continue_button_clicks",
            legacy_event_category: "cigarette_license_task_step_4_submit_button",
            legacy_event_action: "click",
            legacy_event_label: "go_to_cigarette_success_screen_or_error_screen",
          });
        },
      },
      submit: {
        validation_error: () => {
          eventRunner.track({
            event: "cigarette_license_task_validation_error",
            legacy_event_category: "cigarette_license_task_step_4_submit_button",
            legacy_event_action: "submit",
            legacy_event_label: "remain_on_cigarette_license_step_4_validation_error",
          });
        },
        service_error: () => {
          eventRunner.track({
            event: "cigarette_license_task_service_error",
            legacy_event_category: "cigarette_license_task_step_4_submit_button",
            legacy_event_action: "submit",
            legacy_event_label: "remain_on_cigarette_license_step_4_service_error",
          });
        },
      },
      appears: {
        validation_success: () => {
          eventRunner.track({
            event: "cigarette_license_task_validation_success",
            legacy_event_category: "cigarette_license_task_success_screen",
            legacy_event_action: "appear",
            legacy_event_label: "arrive_on_cigarette_submission_success_screen",
          });
        },
      },
    },
    tax_calendar_register_button: {
      click: {
        show_myNJ_registration_prompt_modal: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "tax_calendar_register_button",
            legacy_event_label: "show_myNJ_registration_prompt_modal",
            click_text: "show_myNJ_registration_prompt_modal",
            clicked_to: "myNJ_registration_prompt_modal",
          });
        },
      },
    },
    tax_calendar: {
      submit: {
        tax_calendar_validation_error: () => {
          eventRunner.track({
            event: "form_validation",
            legacy_event_action: "submit",
            legacy_event_category: "tax_calendar",
            legacy_event_label: "tax_calendar_validation_error",
            form_name: "tax_calendar",
            server_response: "error",
          });
        },
        tax_calendar_business_does_not_exist: () => {
          eventRunner.track({
            event: "form_validation",
            legacy_event_action: "submit",
            legacy_event_category: "tax_calendar",
            legacy_event_label: "tax_calendar_business_does_not_exist",
            form_name: "tax_calendar",
            server_response: "not_found",
          });
        },
        business_exists_but_not_in_Gov2Go: () => {
          eventRunner.track({
            event: "form_validation",
            legacy_event_action: "submit",
            legacy_event_category: "tax_calendar",
            legacy_event_label: "business_exists_but_not_in_Gov2Go",
            form_name: "tax_calendar",
            server_response: "found",
          });
        },
        tax_deadlines_added_to_calendar: () => {
          eventRunner.track({
            event: "form_submits",
            form_name: "tax_calendar",
            legacy_event_action: "submit",
            legacy_event_category: "tax_calendar",
            legacy_event_label: "tax_deadlines_added_to_calendar",
            server_response: "success",
          });
        },
      },
      arrive: {
        arrive_calendar_access_v2: () => {
          eventRunner.track({
            event: "tax_calendar_arrive_v2",
            legacy_event_action: "arrive",
            legacy_event_category: "tax_calendar_v2",
            legacy_event_label: "arrive_calendar_access_v2",
            action: "arrive",
            item: "calendar_access_v2",
          });
        },
      },
      click: {
        click_calendar_access_v2: () => {
          eventRunner.track({
            event: "tax_calendar_click_v2",
            legacy_event_action: "click",
            legacy_event_category: "tax_calendar_v2_cta",
            legacy_event_label: "tax_calendar_click_calendar_v2",
            item: "tax_calendar_v2_cta",
          });
        },
      },
    },
    tax_clearance: {
      click: {
        switch_to_step_one: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_category: "tax_clearance_anytime_action_switch_to_step_1",
            legacy_event_action: "click",
            legacy_event_label: "go_to_step_one",
          });
        },
        switch_to_step_two: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_category: "tax_clearance_anytime_action_switch_to_step_2",
            legacy_event_action: "click",
            legacy_event_label: "go_to_step_two",
          });
        },
        switch_to_step_three: () => {
          eventRunner.track({
            event: "task_tab_clicked",
            legacy_event_category: "tax_clearance_anytime_action_switch_to_step_3",
            legacy_event_action: "click",
            legacy_event_label: "go_to_step_three",
          });
        },
      },
      submit: {
        validation_error: () => {
          eventRunner.track({
            event: "form_validation",
            legacy_event_category: "tax_clearance_anytime_action_step_3_save_button",
            legacy_event_action: "submit",
            legacy_event_label: "remain_on_tax_clearance_error",
          });
        },
      },
      appears: {
        validation_success: () => {
          eventRunner.track({
            event: "form_validation",
            legacy_event_category: "tax_clearance_anytime_action_success_screen",
            legacy_event_action: "appear",
            legacy_event_label: "remain_on_tax_clearance_sucess_screen",
          });
        },
      },
    },
    tax_registration_snackbar: {
      submit: {
        show_tax_registration_success_snackbar: () => {
          eventRunner.track({
            event: "graduation_phase_interactions",
            legacy_event_action: "submit",
            legacy_event_category: "tax_registration_modal",
            legacy_event_label: "tax_registration_status_set_to_complete",
            action: "show_tax_registration_success_snackbar",
            item: "tax_registration_snackbar",
          });
        },
      },
    },
    business_formation_review_amendments_external_link: {
      click: {
        go_to_Treasury_amendments_page: () => {
          eventRunner.track({
            event: "outbound_link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_review_amendments_external_link",
            legacy_event_label: "go_to_Treasury_amendments_page",
            form_name: "business_formation",
            on_tab_name: "review_step",
            click_text: "go_to_treasury_amendments_page",
          });
        },
      },
    },
    business_formation_success_amendments_external_link: {
      click: {
        go_to_Treasury_amendments_page: () => {
          eventRunner.track({
            event: "outbound_link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_success_amendments_external_link",
            legacy_event_label: "go_to_Treasury_amendments_page",
            form_name: "business_formation",
            on_tab_name: "success_step",
            click_text: "go_to_treasury_amendments_page",
          });
        },
      },
    },
    profile_formation_date: {
      submit: {
        formation_date_changed: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "profile_formation_date",
            legacy_event_label: "formation_date_changed",
            form_name: "profile",
            questions: { formation_date: "change" },
          });
        },
      },
    },
    myNJ_prompt_modal_complete_button: {
      click: {
        go_to_NavigatorAccount_setup: () => {
          eventRunner.track({
            event: "graduation_phase_interactions",
            legacy_event_action: "click",
            legacy_event_category: "myNJ_prompt_modal_complete_button",
            legacy_event_label: "go_to_NavigatorAccount_setup",
            action: "go_to_NavigatorAccount_setup",
            item: "myNJ_prompt_modal_complete_button",
          });
        },
      },
    },
    formation_nudge_button: {
      click: {
        show_formation_date_modal: () => {
          eventRunner.track({
            event: "graduation_phase_interactions",
            legacy_event_action: "click",
            legacy_event_category: "formation_nudge_button",
            legacy_event_label: "show_formation_date_modal",
            action: "show_formation_date_modal",
            item: "formation_nudge_button",
          });
        },
      },
    },
    landing_page_how_it_works: {
      scroll: {
        how_it_works_seen: () => {
          eventRunner.track({
            event: "scroll_tracking",
            legacy_event_action: "scroll",
            legacy_event_category: "landing_page_how_it_works",
            legacy_event_label: "how_it_works_seen",
            scroll_depth: "how_it_works",
          });
        },
      },
    },
    landing_page_more_support: {
      scroll: {
        more_support_seen: () => {
          eventRunner.track({
            event: "scroll_tracking",
            legacy_event_action: "scroll",
            legacy_event_category: "landing_page_more_support",
            legacy_event_label: "more_support_seen",
            scroll_depth: "more_support_seen",
          });
        },
      },
    },
    task_location_question: {
      submit: {
        location_entered_for_first_time: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "task_location_question",
            legacy_event_label: "location_entered_for_first_time",
            form_name: "task_address_form",
            questions: { location: "first_time" },
          });
        },
      },
    },
    profile_location_question: {
      submit: {
        location_entered_for_first_time: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "profile_location_question",
            legacy_event_label: "location_entered_for_first_time",
            form_name: "profile",
            questions: { location: "first_time" },
          });
        },
      },
    },
    business_formation_location_question: {
      submit: {
        location_entered_for_first_time: () => {
          eventRunner.track({
            event: "form_submits",
            legacy_event_action: "submit",
            legacy_event_category: "business_formation_location_question",
            legacy_event_label: "location_entered_for_first_time",
            on_tab_name: "business_step",
            form_name: "business_formation",
            questions: { location: "first_time" },
          });
        },
      },
    },
    share_calendar_feedback: {
      click: {
        open_live_chat: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "share_calendar_feedback",
            legacy_event_label: "open_live_chat",
            click_text: "share_calendar_feedback",
            clicked_to: "live_chat",
          });
        },
      },
    },
    share_feedback: {
      click: {
        open_live_chat: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "share_feedback",
            legacy_event_label: "open_live_chat",
            click_text: "share_feedback",
            clicked_to: "live_chat",
          });
        },
      },
    },
    skip_to_main_content: {
      click: {
        skip_to_main_content: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "skip_to_main_content_button",
            legacy_event_label: "skip_to_main_content",
            click_text: "skip to main content",
            item: "skip_to_main_content",
          });
        },
      },
    },
    for_you_card_hide_button: {
      click: {
        hide_card: () => {
          eventRunner.track({
            legacy_event_category: "for_you_card_hide_button",
            legacy_event_action: "click",
            legacy_event_label: "hide_card",
            event: "link_clicks",
            click_text: "hide",
            item: "opportunity_card",
          });
        },
      },
    },
    opportunity_card: {
      click: {
        go_to_opportunity_screen: () => {
          eventRunner.track({
            legacy_event_category: "opportunity_card",
            legacy_event_action: "click",
            legacy_event_label: "go_to_opportunity_screen",
            event: "link_clicks",
            item: "opportunity_card",
          });
        },
      },
    },
    for_you_card_unhide_button: {
      click: {
        unhide_card: () => {
          eventRunner.track({
            legacy_event_category: "for_you_card_unhide_button",
            legacy_event_action: "click",
            legacy_event_label: "unhide_card",
            event: "link_clicks",
            click_text: "unhide",
            item: "opportunity_card",
          });
        },
        unhide_cards: () => {
          eventRunner.track({
            legacy_event_category: "for_you_card_unhide_button",
            legacy_event_action: "click",
            legacy_event_label: "unhide_cards",
            event: "navigation_clicks",
            clicked: "expand_contract",
            item: "hidden_opportunities_section",
          });
        },
      },
    },
    go_to_profile_nudge: {
      click: {
        go_to_profile: () => {
          eventRunner.track({
            event: "graduation_phase_interactions",
            legacy_event_action: "click",
            legacy_event_category: "go_to_profile_nudge",
            legacy_event_label: "go_to_profile",
            action: "go_to_profile_screen",
            item: "go_to_profile_nudge_button",
          });
        },
      },
    },
    finish_setup_on_myNewJersey_button: {
      submit: {
        go_to_myNJ_registration: () => {
          eventRunner.track({
            legacy_event_category: "finish_setup_on_myNewJersey_button",
            legacy_event_action: "submit",
            legacy_event_label: "go_to_myNJ_registration",
            event: "form_submits",
            form_name: "account_setup",
            action: "go_to_myNJ_registration",
          });
        },
      },
    },
    anytime_action_button: {
      click: {
        go_to_anytime_action_screen: (fileName: string) => {
          eventRunner.track({
            legacy_event_category: "quick_action_button", // Leaving as "quick_action_button" for historical tracking purposes
            legacy_event_action: "click",
            legacy_event_label: "go_to_quick_action_screen", // Leaving as "go_to_quick_action_screen" for historical tracking purposes
            event: "link_clicks",
            clicked_to: fileName,
          });
        },
      },
    },
    business_formation_help_button: {
      click: {
        open_live_chat: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "business_formation_help_button",
            legacy_event_label: "open_live_chat",
            click_text: "business_formation_help_button",
            clicked_to: "open_live_chat",
          });
        },
      },
    },
    cigarette_license_help_button: {
      click: {
        open_live_chat: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "cigarette_license_help_button",
            legacy_event_label: "open_live_chat",
            click_text: "cigarette_license_help_button",
            clicked_to: "open_live_chat",
          });
        },
      },
    },
    tax_clearance_anytime_action_help_button: {
      click: {
        open_live_chat: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "tax_clearance_anytime_action_help_button",
            legacy_event_label: "open_live_chat",
            click_text: "tax_clearance_anytime_action_help_button",
            clicked_to: "open_live_chat",
          });
        },
        open_live_chat_from_error_alert: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "tax_clearance_anytime_action_error_alert_help_button",
            legacy_event_label: "open_live_chat",
            click_text: "tax_clearance_anytime_action_error_alert_help_button",
            clicked_to: "open_live_chat",
          });
        },
      },
    },
    remove_business_modal_help_button: {
      click: {
        open_live_chat: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "remove_business_modal_help_button",
            legacy_event_label: "open_live_chat",
            click_text: "remove_business_modal_help_button",
            clicked_to: "open_live_chat",
          });
        },
      },
    },
    my_account: {
      click: {
        my_account: () => {
          eventRunner.track({
            event: "navigation_clicks",
            legacy_event_action: "click",
            legacy_event_category: "my_account_link",
            legacy_event_label: "go_to_dashboard",
            click_text: "my_account",
            clicked_to: "dashboard",
          });
        },
      },
    },
    business_nj_gov_logo: {
      click: {
        business_nj_gov_logo: () => {
          eventRunner.track({
            legacy_event_category: "business.nj.gov_link",
            legacy_event_action: "click",
            legacy_event_label: "go_to_business.nj.gov",
            event: "navigation_clicks",
            clicked_to: "business.nj.gov",
            click_text: "business_nj_gov_logo",
          });
        },
      },
    },
    starter_kit_landing: {
      click: {
        start_now_button: () => {
          eventRunner.track({
            legacy_event_category: "starter_kit_landing_start_now_button",
            legacy_event_action: "click",
            legacy_event_label: "go_to_onboarding",
            event: "call_to_action_clicks",
            clicked_to: "onboarding",
          });
        },
        get_my_starter_kit_button: () => {
          eventRunner.track({
            legacy_event_category: "starter_kit_landing_get_my_starter_kit_button",
            legacy_event_action: "click",
            legacy_event_label: "go_to_onboarding",
            event: "call_to_action_clicks",
            clicked_to: "/onboarding",
          });
        },
        get_my_starter_kit_button_footer: () => {
          eventRunner.track({
            legacy_event_category: "starter_kit_landing_get_my_starter_kit_button_footer",
            legacy_event_action: "click",
            legacy_event_label: "go_to_onboarding",
            event: "call_to_action_clicks",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    show_me_funding_opportunities: {
      click: {
        show_me_funding_opportunities: () => {
          eventRunner.track({
            legacy_event_category: "show_me_funding_opportunities_button",
            legacy_event_action: "click",
            legacy_event_label: "show_calendar",
            event: "link_clicks",
            click_text: "show_calendar",
            item: "show_funding_opportunities",
          });
        },
      },
    },
    check_account_help_button: {
      click: {
        open_live_chat: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_action: "click",
            legacy_event_category: "check_account_help_button",
            legacy_event_label: "open_live_chat",
            click_text: "check_account_help_button",
            clicked_to: "open_live_chat",
          });
        },
      },
    },
    check_account_next_button: {
      submit: {
        go_to_myNJ_login: () => {
          eventRunner.track({
            event: "account_clicks",
            legacy_event_action: "click",
            legacy_event_category: "check_account_log_in",
            legacy_event_label: "go_to_myNJ_login",
            clicked: "go_to_myNJ_login",
            item: "check_account_log_in",
          });
        },
      },
    },
    check_account_link_account_button: {
      click: {
        link_account: () => {
          eventRunner.track({
            event: "link_clicks",
            legacy_event_category: "link_your_myNJ_account_link",
            legacy_event_action: "click",
            legacy_event_label: "unhide_card",
            clicked: "link_your_myNJ_account",
            item: "link_your_myNJ_account_link",
            clicked_to: "/onboarding",
          });
        },
      },
    },
    xray_registration_check_status_form: {
      submit: {
        status_lookup_initiated: () => {
          eventRunner.track({
            event: "xray_status_check_started",
            legacy_event_action: "submit",
            legacy_event_category: "xray_registration_check_status_form",
            legacy_event_label: "status_lookup_initiated",
            form_name: "xray_address_form",
          });
        },
      },
    },
    xray_registration_check_status_results: {
      appears: {
        active_registration_found: () => {
          eventRunner.track({
            event: "xray_status_check_success_active",
            legacy_event_action: "appears",
            legacy_event_category: "xray_registration_check_status_results",
            legacy_event_label: "active_registration_found",
          });
        },
        expired_registration_found: () => {
          eventRunner.track({
            event: "xray_status_check_success_expired",
            legacy_event_action: "appears",
            legacy_event_category: "xray_registration_check_status_results",
            legacy_event_label: "expired_registration_found",
          });
        },
      },
    },
    xray_registration_check_status_error: {
      appears: {
        record_not_found_error: () => {
          eventRunner.track({
            event: "xray_lookup_failed",
            legacy_event_action: "appears",
            legacy_event_category: "xray_registration_check_status_error",
            legacy_event_label: "record_not_found_error",
          });
        },
      },
    },
    xray_registration_expired_cta: {
      click: {
        xray_renewal_started_cta: () => {
          eventRunner.track({
            event: "xray_renewal_started_cta",
            legacy_event_action: "click",
            legacy_event_category: "xray_registration_expired_cta",
            legacy_event_label: "renew_registration_button",
          });
        },
      },
    },
    xray_registration_expired_status_card: {
      click: {
        xray_renewal_started_expired_card: () => {
          eventRunner.track({
            event: "xray_renewal_started_expired_card",
            legacy_event_action: "click",
            legacy_event_category: "xray_registration_expired_status_card",
            legacy_event_label: "renew_ref_link",
          });
        },
      },
    },
    email_sbap_clicked: {
      click: {
        email_sbap_clicked: () => {
          eventRunner.track({
            event: "email_sbap_clicked",
            legacy_event_category: "support_request",
            legacy_event_action: "email_button_click",
            legacy_event_label: "environmental_requirements_sbap",
          });
        },
      },
    },
    gen_guidance_stepper_initiated: {
      arrive: {
        general_guidance_initiated: () => {
          eventRunner.track({
            event: "env_requirements_assessment_started",
            legacy_event_action: "arrive",
            legacy_event_category: "environmental_requirements_assessment",
            legacy_event_label: "general_guidance_initiated",
          });
        },
      },
    },
    gen_guidance_stepper_step_category: {
      click: {
        general_guidance_step: (step: number, category: string) => {
          eventRunner.track({
            event: "env_stepper_step_viewed",
            legacy_event_action: "click",
            legacy_event_category: "environmental_requirements_stepper",
            legacy_event_label: `step_${step}_${category}` as LegacyEventLabel,
          });
        },
      },
    },
    gen_guidance_stepper_save_see_results: {
      click: {
        general_guidance_save_see_results: () => {
          eventRunner.track({
            event: "env_final_cta_clicked",
            legacy_event_action: "click",
            legacy_event_category: "environmental_requirements_final_cta",
            legacy_event_label: "save_see_results_clicked",
          });
        },
      },
    },
    gen_guidance_stepper_permits_required_displayed: {
      appears: {
        general_guidance_permits_req_displayed: () => {
          eventRunner.track({
            event: "env_permits_required_displayed",
            legacy_event_action: "appears",
            legacy_event_category: "environmental_requirements_results",
            legacy_event_label: "permits_required_displayed",
          });
        },
      },
    },
    gen_guidance_stepper_no_permits_displayed: {
      appears: {
        general_guidance_no_permits_displayed: () => {
          eventRunner.track({
            event: "env_no_permits_displayed",
            legacy_event_action: "appears",
            legacy_event_category: "environmental_requirements_results",
            legacy_event_label: "no_permits_needed_displayed",
          });
        },
      },
    },
    gen_guidance_stepper_env_req_edits: {
      click: {
        general_guidance_env_req_edits: () => {
          eventRunner.track({
            event: "env_responses_edit_started",
            legacy_event_action: "click",
            legacy_event_category: "environmental_requirements_edit",
            legacy_event_label: "edit_responses_clicked",
          });
        },
      },
    },
    gen_guidance_stepper_contact_info_engagement: {
      mouseover: {
        general_guidance_contact_info_engage: () => {
          eventRunner.track({
            event: "env_contact_info_engaged",
            legacy_event_action: "mouseover",
            legacy_event_category: "environmental_requirements_contact",
            legacy_event_label: "contact_info_hovered",
          });
        },
      },
    },
    gen_guidance_stepper_continue_without_saving: {
      click: {
        general_guidance_continue_wo_saving: () => {
          eventRunner.track({
            event: "env_continue_without_auth",
            legacy_event_action: "click",
            legacy_event_category: "environmental_requirements_save",
            legacy_event_label: "continue_without_saving_clicked",
          });
        },
      },
    },
    gen_guidance_stepper_save_modal_displayed: {
      appears: {
        general_guidance_save_modal_displayed: () => {
          eventRunner.track({
            event: "env_save_progress_prompted",
            legacy_event_action: "appears",
            legacy_event_category: "environmental_requirements_save",
            legacy_event_label: "mynewjersey_modal_displayed",
          });
        },
      },
    },
    gen_guidance_stepper_responses_accordion_opened: {
      click: {
        general_guidance_resp_accordion_opened: () => {
          eventRunner.track({
            event: "env_help_responses_opened",
            legacy_event_action: "click",
            legacy_event_category: "environmental_requirements_help",
            legacy_event_label: "responses_accordion_opened",
          });
        },
      },
    },
    gen_guidance_stepper_dep_accordion_opened: {
      click: {
        general_guidance_dep_accordion_opened: () => {
          eventRunner.track({
            event: "env_help_dep_opened",
            legacy_event_action: "click",
            legacy_event_category: "environmental_requirements_help",
            legacy_event_label: "dep_accordion_opened",
          });
        },
      },
    },
    gen_guidance_stepper_sbap_accordion_opened: {
      click: {
        general_guidance_sbap_accordion_opened: () => {
          eventRunner.track({
            event: "env_help_sbap_opened",
            legacy_event_action: "click",
            legacy_event_category: "environmental_requirements_help",
            legacy_event_label: "sbap_accordion_opened",
          });
        },
      },
    },
    non_essential_question_view: {
      view: {
        non_essential_question_view: (question: string) => {
          eventRunner.track({
            event: "non_essential_question_view",
            legacy_event_action: "view",
            legacy_event_category: `non_essential_question_view_${question}`,
            legacy_event_label: "non_essential_question_radio_button",
          });
        },
      },
    },
    non_essential_question_set: {
      view: {
        non_essential_question_set: (question: string, value: string) => {
          eventRunner.track({
            event: "non_essential_question_view",
            legacy_event_action: "set",
            legacy_event_category: `non_essential_question_${question}_${value}`,
            legacy_event_label: "non_essential_question_radio_button",
          });
        },
      },
    },
  },
};
