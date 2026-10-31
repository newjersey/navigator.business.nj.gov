import { randomUUID } from "node:crypto";
import { getCurrentDateFormatted } from "@shared/dateHelpers";
import winston from "winston";
import WinstonCloudWatch from "winston-cloudwatch";

export interface LogWriterType {
  LogError(message: string, details?: unknown): void;
  LogInfo(message: string): void;
  GetId(): string;
}

const serializeLogDetails = (details: unknown): unknown => {
  return typeof details === "object" &&
    details !== null &&
    "toJSON" in details &&
    typeof details.toJSON === "function"
    ? details.toJSON()
    : details;
};

const GetId = (): string => {
  return randomUUID();
};

export const DummyLogWriter: LogWriterType = {
  LogError: () => {
    return;
  },
  LogInfo: () => {
    return;
  },
  GetId: () => {
    return "";
  },
};

export const ConsoleLogWriter: LogWriterType = {
  LogError: async (message: string, details?: unknown): Promise<void> => {
    try {
      const jsonDetails = serializeLogDetails(details);
      console.error(`${message} - ${JSON.stringify(jsonDetails)}`);
    } catch (error) {
      console.error(`Error with LogError:${error}`);
    }
  },
  LogInfo: async (message: string): Promise<void> => {
    try {
      console.info(message);
    } catch (error) {
      console.error(`Error with LogInfo:${error}`);
    }
  },
  GetId: () => {
    return "";
  },
};

export const LogWriter = (groupName: string, logStream: string, region?: string): LogWriterType => {
  const logger = winston.add(
    new WinstonCloudWatch({
      level: "silly",
      name: `NavigatorCloudWatch-WinstonLogging${groupName}${logStream}`,
      logGroupName: `/${groupName}/${logStream}`,
      logStreamName: `${logStream}-${getCurrentDateFormatted("YYYYMMDD")}`,
      awsRegion: region || process.env.AWS_REGION,
    }),
  );

  const LogError = async (message: string, details?: unknown): Promise<void> => {
    try {
      const jsonDetails = serializeLogDetails(details);
      console.error(`${message} - ${JSON.stringify(jsonDetails)}`);
      winston.error(message, details);
      await FlushLog();
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error(`Error with LogInfo:${error}`);
      }
    }
  };

  const LogInfo = async (message: string): Promise<void> => {
    try {
      console.info(message);
      winston.info(message);
      await FlushLog();
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error(`Error with LogInfo:${error}`);
      }
    }
  };

  const FlushLog = async (): Promise<void> => {
    const winstonCloudWatchTransport = logger.transports.find((t) => {
      // winston-cloudwatch sets `name` from its options at runtime but doesn't declare it.
      return (
        (t as typeof t & { name?: string }).name ===
        `NavigatorCloudWatch-WinstonLogging${groupName}${logStream}`
      );
    }) as WinstonCloudWatch;
    await new Promise((resolve) => {
      winstonCloudWatchTransport.kthxbye(resolve);
    });
  };

  return {
    LogError,
    LogInfo,
    GetId,
  };
};
