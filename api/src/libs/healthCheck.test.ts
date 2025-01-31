import { runHealthChecks } from "@libs/healthCheck";
import { DummyLogWriter, LogWriter } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;
const DEBUG = Boolean(process.env.DEBUG ?? false);

describe("healthCheck", () => {
  const logger = LogWriter(`HealthCheckService`, "ApiLogs");

  it("returns an object with pass statuses if success is true", async () => {
    mockAxios.get.mockResolvedValue({ data: { success: true } });
    expect(await runHealthChecks(DEBUG ? logger : DummyLogWriter)).toStrictEqual({
      self: "PASS",
      elevator: "PASS",
      fireSafety: "PASS",
      housing: "PASS",
      rgbDynamicsLicenseStatus: "PASS",
      webserviceLicenseStatus: "PASS",
      webserviceFormation: "PASS",
    });
  });

  it("returns an object with fail statuses if success is false", async () => {
    mockAxios.get.mockResolvedValue({ data: { success: false } });
    expect(await runHealthChecks(DEBUG ? logger : DummyLogWriter)).toStrictEqual({
      self: "FAIL",
      elevator: "FAIL",
      fireSafety: "FAIL",
      housing: "FAIL",
      rgbDynamicsLicenseStatus: "FAIL",
      webserviceLicenseStatus: "FAIL",
      webserviceFormation: "FAIL",
    });
  });

  it("returns an object with error statuses if request fails/errors out", async () => {
    mockAxios.get.mockRejectedValue({});
    expect(await runHealthChecks(DEBUG ? logger : DummyLogWriter)).toStrictEqual({
      self: "ERROR",
      elevator: "ERROR",
      fireSafety: "ERROR",
      housing: "ERROR",
      rgbDynamicsLicenseStatus: "ERROR",
      webserviceLicenseStatus: "ERROR",
      webserviceFormation: "ERROR",
    });
  });
});
