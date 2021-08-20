import { AxiosError } from "axios";
import winston from "winston";
import WinstonCloudWatch from "winston-cloudwatch";

export interface LogWriterType {
  LogError(message: string, details?: AxiosError): void;
  LogInfo(message: string): void;
}

export const LogWriter = (region: string, groupName: string, logStream: string): LogWriterType => {
  winston.add(
    new WinstonCloudWatch({
      name: "NavigatorCloudWatch-WinstonLogging",
      logGroupName: groupName,
      logStreamName: logStream,
      awsRegion: region,
    })
  );

  const LogError = (message: string, details?: AxiosError): void => {
    winston.error(message, details);
  };

  const LogInfo = (message: string): void => {
    winston.info(message);
  };

  return {
    LogError,
    LogInfo,
  };
};
