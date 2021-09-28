import { AxiosError } from "axios";
import dayjs from "dayjs";
import winston from "winston";
import WinstonCloudWatch from "winston-cloudwatch";

export interface LogWriterType {
  LogError(message: string, details?: AxiosError): void;
  LogInfo(message: string): void;
}

export const LogWriter = (groupName: string, logStream: string, region?: string): LogWriterType => {
  const logger = winston.add(
    new WinstonCloudWatch({
      level: "silly",
      name: `NavigatorCloudWatch-WinstonLogging${groupName}${logStream}`,
      logGroupName: `/${groupName}/${logStream}`,
      logStreamName: `${logStream}-${dayjs().format("YYYYMMDD")}`,
      awsRegion: region || process.env.AWS_REGION,
      retentionInDays: 180,
    })
  );

  const LogError = async (message: string, details?: AxiosError): Promise<void> => {
    try {
      winston.error(message, details);
      await FlushLog();
    } catch (ex) {
      console.error(`Error with LogError:${ex}`);
    }
  };

  const LogInfo = async (message: string): Promise<void> => {
    try {
      winston.info(message);
      await FlushLog();
    } catch (ex) {
      console.error(`Error with LogInfo:${ex}`);
    }
  };

  const FlushLog = async (): Promise<void> => {
    const winstonCloudWatchTransport = logger.transports.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (t) => (t as unknown as any).name === `NavigatorCloudWatch-WinstonLogging${groupName}${logStream}`
    );
    await new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (winstonCloudWatchTransport as unknown as any).kthxbye(resolve);
    });
  };

  return {
    LogError,
    LogInfo,
  };
};
