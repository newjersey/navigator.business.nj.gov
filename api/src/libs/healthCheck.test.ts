import { runHealthChecks } from "@libs/healthCheck";
import { DummyLogWriter } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@libs/ssmUtils", () => ({
  getConfigValue: jest.fn(),
}));

const mockCloudWatchSend = jest.fn();
jest.mock("@aws-sdk/client-cloudwatch", () => ({
  ...jest.requireActual("@aws-sdk/client-cloudwatch"),
  CloudWatchClient: jest.fn().mockImplementation(() => ({
    send: (...args: unknown[]): unknown => mockCloudWatchSend(...args),
  })),
}));

describe("healthCheck", () => {
  const logger = DummyLogWriter;

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
      taxFilingClient: "ERROR",
    });
  });

  it.each([
    [
      "fails",
      (): void => {
        mockAxios.get.mockResolvedValue({ data: { success: false } });
      },
    ],
    [
      "errors out",
      (): void => {
        mockAxios.get.mockRejectedValue({});
      },
    ],
  ])("waits for the CloudWatch metric to be sent when a check %s", async (_, arrangeCheck) => {
    arrangeCheck();
    let releaseMetric = (): void => {};
    mockCloudWatchSend.mockReturnValue(
      new Promise<void>((resolve) => {
        releaseMetric = resolve;
      }),
    );
    const stillPending = Symbol("still pending");

    const healthChecks = runHealthChecks(logger);
    const afterIoTurn = new Promise((resolve) => setImmediate(() => resolve(stillPending)));

    expect(await Promise.race([healthChecks, afterIoTurn])).toBe(stillPending);
    releaseMetric();
    await healthChecks;
  });
});
