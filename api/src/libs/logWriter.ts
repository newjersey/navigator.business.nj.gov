import { getCurrentDateFormatted } from "@shared/dateHelpers";
import { AxiosError } from "axios";
import { randomUUID } from "node:crypto";
import winston from "winston";
import WinstonCloudWatch from "winston-cloudwatch";

export interface LogWriterType {
  LogError(message: string, details?: AxiosError): void;
  LogInfo(message: string): void;
  GetId(): string;
}

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
  LogError: async (message: string, details?: AxiosError): Promise<void> => {
    try {
      console.error(`${message} - ${JSON.stringify(details?.toJSON())}`);
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

  const LogError = async (message: string, details?: AxiosError): Promise<void> => {
    try {
      const jsonDetails = typeof details?.toJSON === "function" ? details.toJSON() : details;
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
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return (
        (t as unknown as any).name === `NavigatorCloudWatch-WinstonLogging${groupName}${logStream}`
      );
    });
    await new Promise((resolve) => {
      (winstonCloudWatchTransport as unknown as any).kthxbye(resolve);
    });
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };

  return {
    LogError,
    LogInfo,
    GetId,
  };
};
