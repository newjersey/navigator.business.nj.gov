import { OutageAlertBar } from "@/components/OutageAlertBar";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateOutageConfig } from "@/test/factories";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";

vi.mock("axios");
const mockAxios = axios as vi.Mocked<typeof axios>;

describe("<OutageAlertBar />", () => {
  let originalUrlValue: string | undefined;
  const url = "www.example.com";

  beforeEach(() => {
    vi.resetAllMocks();
    originalUrlValue = process.env.OUTAGE_ALERT_CONFIG_URL;
    process.env.OUTAGE_ALERT_CONFIG_URL = url;
  });

  afterEach(() => {
    process.env.OUTAGE_ALERT_CONFIG_URL = originalUrlValue;
  });

  it("does not show up if fetch call fails", async () => {
    mockAxios.get.mockRejectedValue({});
    render(<OutageAlertBar />);
    await waitFor(() => {
      expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
    });
  });

  it("does not show up if feature is disabled", async () => {
    mockAxios.get.mockResolvedValue({
      data: generateOutageConfig({
        FEATURE_ENABLE_OUTAGE_ALERT_BAR: false,
        OUTAGE_ALERT_TYPE: "ALL",
      }),
    });
    render(<OutageAlertBar />);
    await waitFor(() => {
      expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
    });
  });

  it("does not show up if feature flag is undefined", async () => {
    mockAxios.get.mockResolvedValue({
      data: generateOutageConfig({
        FEATURE_ENABLE_OUTAGE_ALERT_BAR: undefined,
        OUTAGE_ALERT_TYPE: "ALL",
      }),
    });
    render(<OutageAlertBar />);
    await waitFor(() => {
      expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
    });
  });

  it("shows up with message from config when enabled", async () => {
    mockAxios.get.mockResolvedValue({
      data: generateOutageConfig({
        FEATURE_ENABLE_OUTAGE_ALERT_BAR: true,
        OUTAGE_ALERT_TYPE: "ALL",
        OUTAGE_ALERT_MESSAGE: "some cool message",
      }),
    });
    render(<OutageAlertBar />);
    await waitFor(() => {
      expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
    });
    expect(screen.getByText("some cool message")).toBeInTheDocument();
  });

  it("does not show bar when message is undefined", async () => {
    mockAxios.get.mockResolvedValue({
      data: generateOutageConfig({
        FEATURE_ENABLE_OUTAGE_ALERT_BAR: true,
        OUTAGE_ALERT_MESSAGE: undefined,
        OUTAGE_ALERT_TYPE: "ALL",
      }),
    });
    render(<OutageAlertBar />);
    await waitFor(() => {
      expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
    });
  });

  describe("alert type", () => {
    it("when undefined - does not show outage alert", async () => {
      mockAxios.get.mockResolvedValue({
        data: generateOutageConfig({
          FEATURE_ENABLE_OUTAGE_ALERT_BAR: true,
          OUTAGE_ALERT_TYPE: undefined,
        }),
      });
      render(<OutageAlertBar />);
      await waitFor(() => {
        expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
      });
    });

    describe("when ALL", () => {
      beforeEach(() => {
        mockAxios.get.mockResolvedValue({
          data: generateOutageConfig({
            FEATURE_ENABLE_OUTAGE_ALERT_BAR: true,
            OUTAGE_ALERT_TYPE: "ALL",
          }),
        });
      });

      it("shows alert bar for logged-in users", async () => {
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.TRUE }));
        await waitFor(() => {
          expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
        });
      });

      it("shows alert bar for non-logged-in users", async () => {
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.FALSE }));
        await waitFor(() => {
          expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
        });
      });

      it("shows alert bar for unknown-logged-in users", async () => {
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.UNKNOWN }));
        await waitFor(() => {
          expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
        });
      });
    });

    describe("when LOGGED_IN_ONLY", () => {
      beforeEach(() => {
        mockAxios.get.mockResolvedValue({
          data: generateOutageConfig({
            FEATURE_ENABLE_OUTAGE_ALERT_BAR: true,
            OUTAGE_ALERT_TYPE: "LOGGED_IN_ONLY",
          }),
        });
      });

      it("shows alert bar for logged-in users", async () => {
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.TRUE }));
        await waitFor(() => {
          expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
        });
      });

      it("does not show alert bar for non-logged-in users", async () => {
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.FALSE }));
        await waitFor(() => {
          expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
        });
      });

      it("does not show alert bar for unknown-logged-in users", async () => {
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.UNKNOWN }));
        await waitFor(() => {
          expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
        });
      });
    });

    describe("when UNREGISTERED_ONLY", () => {
      beforeEach(() => {
        mockAxios.get.mockResolvedValue({
          data: generateOutageConfig({
            FEATURE_ENABLE_OUTAGE_ALERT_BAR: true,
            OUTAGE_ALERT_TYPE: "UNREGISTERED_ONLY",
          }),
        });
      });

      it("does not show alert bar for logged-in users", async () => {
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.TRUE }));
        await waitFor(() => {
          expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
        });
      });

      it("shows alert bar for non-logged-in users", async () => {
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.FALSE }));
        await waitFor(() => {
          expect(screen.getByTestId("outage-alert-bar")).toBeInTheDocument();
        });
      });

      it("does not show alert bar for unknown-logged-in users", async () => {
        render(withAuth(<OutageAlertBar />, { isAuthenticated: IsAuthenticated.UNKNOWN }));
        await waitFor(() => {
          expect(screen.queryByTestId("outage-alert-bar")).not.toBeInTheDocument();
        });
      });
    });
  });
});
