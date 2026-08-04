import { type CryptoClient } from "@domain/types";
import { type LogWriterType } from "@libs/logWriter";

export interface MigrationClients {
  cryptoClient: CryptoClient;
  newHashingClient?: CryptoClient;
  logger?: Pick<LogWriterType, "LogError">;
}
