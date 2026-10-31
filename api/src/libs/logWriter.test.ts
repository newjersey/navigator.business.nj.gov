import { ConsoleLogWriter, LogWriter, type LogWriterType } from "@libs/logWriter";
import winston from "winston";

jest.mock("winston");
const mockWinston = winston as jest.Mocked<typeof winston>;

describe("Logger", () => {
  let logger: LogWriterType;

  beforeEach(() => {
    logger = LogWriter("test", "test", "us-test-1");
    jest.resetAllMocks();
  });

  it("Logs an error message", () => {
    logger.LogError("test error");
    expect(mockWinston.error).toHaveBeenCalledTimes(1);
  });

  it("Logs an info message", () => {
    logger.LogInfo("test error");
    expect(mockWinston.info).toHaveBeenCalledTimes(1);
  });
});

describe("ConsoleLogWriter", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it("logs details through their toJSON, as AxiosError provides", () => {
    const details = { toJSON: (): unknown => ({ status: 500 }), config: { headers: {} } };
    ConsoleLogWriter.LogError("request failed", details);
    expect(consoleError).toHaveBeenCalledWith('request failed - {"status":500}');
  });

  it("logs plain details as JSON", () => {
    ConsoleLogWriter.LogError("request failed", { status: 404 });
    expect(consoleError).toHaveBeenCalledWith('request failed - {"status":404}');
  });
});
