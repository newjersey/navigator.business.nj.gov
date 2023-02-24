import { OutageAlertBar } from "@/components/OutageAlertBar";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { render, screen } from "@testing-library/react";

describe("<OutageAlertBar />", () => {
  let originalFeatureValue: string | undefined;
  let originalMessageValue: string | undefined;
  let originalTypeValue: string | undefined;

  beforeEach(() => {
    originalFeatureValue = process.env.FEATURE_ENABLE_OUTAGE_ALERT_BAR;
    originalMessageValue = process.env.OUTAGE_ALERT_MESSAGE;
    originalTypeValue = process.env.OUTAGE_ALERT_TYPE;
  });

  afterEach(() => {
    process.env.FEATURE_ENABLE_OUTAGE_ALERT_BAR = originalFeatureValue;
    process.env.OUTAGE_ALERT_MESSAGE = originalMessageValue;
    process.env.OUTAGE_ALERT_TYPE = originalTypeValue;
  });

  it("does not show up if feature is disabled", () => {
    process.env.FEATURE_ENABLE_OUTAGE_ALERT_BAR = "false";
    render(<OutageAlertBar />);
    expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
  });

  it("does not show up if feature flag is undefined", () => {
    delete process.env.FEATURE_ENABLE_OUTAGE_ALERT_BAR;
    render(<OutageAlertBar />);
    expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
  });

  it("shows up if feature is enabled", () => {
    process.env.FEATURE_ENABLE_OUTAGE_ALERT_BAR = "true";
    render(<OutageAlertBar />);
    expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
  });

  it("shows message from environment", () => {
    process.env.FEATURE_ENABLE_OUTAGE_ALERT_BAR = "true";
    process.env.OUTAGE_ALERT_MESSAGE = "some cool message";
    render(<OutageAlertBar />);
    expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
    expect(screen.getByText("some cool message")).toBeInTheDocument();
  });

  it("does not show bar when message is undefined", () => {
    process.env.FEATURE_ENABLE_OUTAGE_ALERT_BAR = "true";
    delete process.env.OUTAGE_ALERT_MESSAGE;
    render(<OutageAlertBar />);
    expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
  });

  describe("alert type", () => {
    beforeEach(() => {
      process.env.FEATURE_ENABLE_OUTAGE_ALERT_BAR = "true";
      process.env.OUTAGE_ALERT_MESSAGE = "some message ";
    });

    it("when undefined - does not show outage alert", () => {
      delete process.env.OUTAGE_ALERT_TYPE;
      render(<OutageAlertBar />);
      expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
    });

    describe("when ALL", () => {
      it("shows alert bar for logged-in users", () => {
        process.env.OUTAGE_ALERT_TYPE = "ALL";
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.TRUE }));
        expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
      });

      it("shows alert bar for non-logged-in users", () => {
        process.env.OUTAGE_ALERT_TYPE = "ALL";
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.FALSE }));
        expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
      });

      it("shows alert bar for unknown-logged-in users", () => {
        process.env.OUTAGE_ALERT_TYPE = "ALL";
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.UNKNOWN }));
        expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
      });
    });

    describe("when LOGGED_IN_ONLY", () => {
      it("shows alert bar for logged-in users", () => {
        process.env.OUTAGE_ALERT_TYPE = "LOGGED_IN_ONLY";
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.TRUE }));
        expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
      });

      it("does not show alert bar for non-logged-in users", () => {
        process.env.OUTAGE_ALERT_TYPE = "LOGGED_IN_ONLY";
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.FALSE }));
        expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
      });

      it("does not show alert bar for unknown-logged-in users", () => {
        process.env.OUTAGE_ALERT_TYPE = "LOGGED_IN_ONLY";
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.UNKNOWN }));
        expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
      });
    });

    describe("when UNREGISTERED_ONLY", () => {
      it("does not show alert bar for logged-in users", () => {
        process.env.OUTAGE_ALERT_TYPE = "UNREGISTERED_ONLY";
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.TRUE }));
        expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
      });

      it("shows alert bar for non-logged-in users", () => {
        process.env.OUTAGE_ALERT_TYPE = "UNREGISTERED_ONLY";
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.FALSE }));
        expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
      });

      it("does not show alert bar for unknown-logged-in users", () => {
        process.env.OUTAGE_ALERT_TYPE = "UNREGISTERED_ONLY";
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.UNKNOWN }));
        expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
      });
    });
  });
});
