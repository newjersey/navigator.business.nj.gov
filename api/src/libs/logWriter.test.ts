import winston from "winston";
import { LogWriter, LogWriterType } from "./logWriter";

jest.mock("winston");
const mockWinston = winston as jest.Mocked<typeof winston>;

describe("Logger", () => {
  let logger: LogWriterType;

  beforeEach(() => {
    logger = LogWriter("us-test-1", "test", "test");
    jest.resetAllMocks();
  });

  it("Logs an error message", () => {
    logger.LogError("test error");
    expect(mockWinston.error).toBeCalledTimes(1);
  });

  it("Logs an info message", () => {
    logger.LogInfo("test error");
    expect(mockWinston.info).toBeCalledTimes(1);
  });
});
