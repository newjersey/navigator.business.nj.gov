import { LogWriter, LogWriterType } from "@libs/logWriter";
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
