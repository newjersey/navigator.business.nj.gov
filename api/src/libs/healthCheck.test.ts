import { runHealthChecks } from "@libs/healthCheck";
import { LogWriter } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("healthCheck", () => {
  const logger = LogWriter(`HealthCheckService`, "ApiLogs");

  it("returns an object with pass statuses if success is true", async () => {
    mockAxios.get.mockResolvedValue({ data: { success: true } });
    expect(await runHealthChecks(logger)).toStrictEqual({
      self: "PASS",
      elevator: "PASS",
      fireSafety: "PASS",
      housing: "PASS",
      "dynamics-licenseStatus": "PASS",
      "webservice-licenseStatus": "PASS",
      "webservice-formation": "PASS",
    });
  });

  it("returns an object with fail statuses if success is false", async () => {
    mockAxios.get.mockResolvedValue({ data: { success: false } });
    expect(await runHealthChecks(logger)).toStrictEqual({
      self: "FAIL",
      elevator: "FAIL",
      fireSafety: "FAIL",
      housing: "FAIL",
      "dynamics-licenseStatus": "FAIL",
      "webservice-licenseStatus": "FAIL",
      "webservice-formation": "FAIL",
    });
  });

  it("returns an object with error statuses if request fails/errors out", async () => {
    mockAxios.get.mockRejectedValue({});
    expect(await runHealthChecks(logger)).toStrictEqual({
      self: "ERROR",
      elevator: "ERROR",
      fireSafety: "ERROR",
      housing: "ERROR",
      "dynamics-licenseStatus": "ERROR",
      "webservice-licenseStatus": "ERROR",
      "webservice-formation": "ERROR",
    });
  });
});
