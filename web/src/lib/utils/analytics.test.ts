import analytics from "./analytics";
import analyticsBase from "./analytics-base";

vi.mock("@/lib/utils/analytics-base", () => ({
  sendEvent: vi.fn(),
  userUpdate: vi.fn(),
  context: { calendar_view: undefined },
}));

const mockAnalyticsBase = analyticsBase as vi.Mocked<typeof analyticsBase>;

describe("analytics", () => {
  const originalWindowLocation = window.location;

  beforeEach(() => {
    vi.resetAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      enumerable: true,
      value: new URL(window.location.href),
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      enumerable: true,
      value: originalWindowLocation,
    });
  });

  describe("should call sendEvent", () => {
    describe("multiple events when there are multiple questions", () => {
      it("should call sendEvent with indexed question and response indexed to value position", () => {
        analytics.eventRunner.track({
          event: "form_submits",
          form_name: "industry_essential_questions",
          questions: { car_service_size: "large_size", certifiedInteriorDesigner: "yes" },
        });

        expect(mockAnalyticsBase.sendEvent).toHaveBeenNthCalledWith(1, {
          event: "form_submits",
          form_name: "industry_essential_questions",
          hostname: "localhost",
          on_site_section: "landing_page",
          question: "car_service_size",
          response: "large_size",
        });

        expect(mockAnalyticsBase.sendEvent).toHaveBeenNthCalledWith(2, {
          event: "form_submits",
          form_name: "industry_essential_questions",
          hostname: "localhost",
          on_site_section: "landing_page",
          question: "certifiedInteriorDesigner",
          response: "yes",
        });
      });
    });

    describe("on_site_sections, on_task_id, and hostname based on location", () => {
      it("should be landing_page", () => {
        window.location.href = "https://localhost";
        analytics.eventRunner.track({ event: "account_clicks" });
        expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith({
          event: "account_clicks",
          hostname: "localhost",
          on_site_section: "landing_page",
        });
      });

      it("should be onboarding_screen", () => {
        window.location.href = "https://localhost/onboarding";
        analytics.eventRunner.track({ event: "account_clicks" });
        expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith({
          event: "account_clicks",
          hostname: "localhost",
          on_site_section: "onboarding_screen",
        });
      });

      it("should be dashboard_page", () => {
        window.location.href = "https://localhost/dashboard";
        analytics.eventRunner.track({ event: "account_clicks" });
        expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith({
          event: "account_clicks",
          hostname: "localhost",
          on_site_section: "dashboard_screen",
        });
      });

      it("should be profile_screen", () => {
        window.location.href = "https://localhost/profile";
        analytics.eventRunner.track({ event: "account_clicks" });
        expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith({
          event: "account_clicks",
          hostname: "localhost",
          on_site_section: "profile_screen",
        });
      });

      it("should be generic_task_screen", () => {
        window.location.href = "https://localhost/tasks/evaluate-your-location";
        analytics.eventRunner.track({ event: "account_clicks" });
        expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith({
          event: "account_clicks",
          hostname: "localhost",
          on_site_section: "generic_task_screen",
          on_task_id: "evaluate-your-location",
        });
      });

      it("should be business_formation_task", () => {
        window.location.href = "https://localhost/tasks/form-business-entity";
        analytics.eventRunner.track({ event: "account_clicks" });
        expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith({
          event: "account_clicks",
          hostname: "localhost",
          on_site_section: "business_formation_task",
          on_task_id: "form-business-entity",
        });
      });

      it("should be cannabis_task", () => {
        window.location.href = "https://localhost/tasks/conditional-permit-cannabis";
        analytics.eventRunner.track({ event: "account_clicks" });
        expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith({
          event: "account_clicks",
          hostname: "localhost",
          on_site_section: "cannabis_task",
          on_task_id: "conditional-permit-cannabis",
        });
      });

      it("should be generic_filing_screen", () => {
        window.location.href = "https://localhost/filings/annual-report";
        analytics.eventRunner.track({ event: "account_clicks" });
        expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith({
          event: "account_clicks",
          hostname: "localhost",
          on_site_section: "generic_filing_screen",
        });
      });

      it("should hide querystring for on_task_tab parsing", () => {
        window.location.href = "https://localhost/tasks/conditional-permit-cannabis?foo=bar";
        analytics.eventRunner.track({ event: "account_clicks" });
        expect(mockAnalyticsBase.sendEvent).toHaveBeenCalledWith({
          event: "account_clicks",
          hostname: "localhost",
          on_site_section: "cannabis_task",
          on_task_id: "conditional-permit-cannabis",
        });
      });
    });
  });
});
