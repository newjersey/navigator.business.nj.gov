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

const isNotTestEnv = process.env.NODE_ENV !== "test";

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
      isNotTestEnv && console.error(`${message} - ${JSON.stringify(details?.toJSON())}`);
    } catch (error) {
      isNotTestEnv && console.error(`Error with LogInfo:${error}`);
    }
  },
  LogInfo: async (message: string): Promise<void> => {
    try {
      isNotTestEnv && console.info(message);
    } catch (error) {
      isNotTestEnv && console.error(`Error with LogInfo:${error}`);
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
    })
  );

  const LogError = async (message: string, details?: AxiosError): Promise<void> => {
    try {
      isNotTestEnv && console.error(`${message} - ${JSON.stringify(details?.toJSON())}`);
      winston.error(message, details);
      await FlushLog();
    } catch (error) {
      isNotTestEnv && console.error(`Error with LogInfo:${error}`);
    }
  };

  const LogInfo = async (message: string): Promise<void> => {
    try {
      isNotTestEnv && console.info(message);
      winston.info(message);
      await FlushLog();
    } catch (error) {
      isNotTestEnv && console.error(`Error with LogInfo:${error}`);
    }
  };

  const FlushLog = async (): Promise<void> => {
    const winstonCloudWatchTransport = logger.transports.find((t) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (t as unknown as any).name === `NavigatorCloudWatch-WinstonLogging${groupName}${logStream}`;
    });
    await new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (winstonCloudWatchTransport as unknown as any).kthxbye(resolve);
    });
  };

  return {
    LogError,
    LogInfo,
    GetId,
  };
};
