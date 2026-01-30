import { runHealthChecks } from "@libs/healthCheck";
import { DummyLogWriter } from "@libs/logWriter";
import { CONFIG_VARS, getConfigValue } from "@libs/ssmUtils";
import axios from "axios";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@libs/ssmUtils", () => ({
  getConfigValue: jest.fn(),
}));

const mockGetConfigValue = getConfigValue as jest.MockedFunction<typeof getConfigValue>;

describe("healthCheck", () => {
  const logger = DummyLogWriter;

  beforeEach(() => {
    mockGetConfigValue.mockImplementation(async (paramName: CONFIG_VARS) => {
      if (paramName === "FEATURE_CIGARETTE_LICENSE") return "true";
      return "false";
    });
  });

  it("returns an object with pass statuses if success is true", async () => {
    mockAxios.get.mockResolvedValue({ data: { success: true } });
    expect(await runHealthChecks(logger)).toStrictEqual({
      self: "PASS",
      elevator: "PASS",
      fireSafety: "PASS",
      housing: "PASS",
      rgbDynamicsLicenseStatus: "PASS",
      webserviceLicenseStatus: "PASS",
      webserviceFormation: "PASS",
      taxClearance: "PASS",
      xrayRegistration: "PASS",
      cigaretteLicense: "PASS",
      cigaretteEmailClient: "PASS",
      taxFilingClient: "PASS",
    });
  });

  it("returns an object with fail statuses if success is false", async () => {
    mockAxios.get.mockResolvedValue({ data: { success: false } });
    expect(await runHealthChecks(logger)).toStrictEqual({
      self: "FAIL",
      elevator: "FAIL",
      fireSafety: "FAIL",
      housing: "FAIL",
      rgbDynamicsLicenseStatus: "FAIL",
      webserviceLicenseStatus: "FAIL",
      webserviceFormation: "FAIL",
      taxClearance: "FAIL",
      xrayRegistration: "FAIL",
      cigaretteLicense: "FAIL",
      cigaretteEmailClient: "FAIL",
      taxFilingClient: "FAIL",
    });
  });

  it("returns an object with error statuses if request fails/errors out", async () => {
    mockAxios.get.mockRejectedValue({});
    expect(await runHealthChecks(logger)).toStrictEqual({
      self: "ERROR",
      elevator: "ERROR",
      fireSafety: "ERROR",
      housing: "ERROR",
      rgbDynamicsLicenseStatus: "ERROR",
      webserviceLicenseStatus: "ERROR",
      webserviceFormation: "ERROR",
      taxClearance: "ERROR",
      xrayRegistration: "ERROR",
      cigaretteLicense: "ERROR",
      cigaretteEmailClient: "ERROR",
      taxFilingClient: "ERROR",
    });
  });

  describe("flagged health checks", () => {
    it("includes cigarette health checks when feature flag is on", async () => {
      const result = await runHealthChecks(logger);
      expect(Object.keys(result)).toContain("cigaretteLicense");
      expect(Object.keys(result)).toContain("cigaretteEmailClient");
    });

    it("excludes cigarette health checks when feature flag is off", async () => {
      mockGetConfigValue.mockImplementation(async () => {
        return "false";
      });

      const result = await runHealthChecks(logger);
      expect(Object.keys(result)).not.toContain("cigaretteLicense");
      expect(Object.keys(result)).not.toContain("cigaretteEmailClient");
    });
  });
});
