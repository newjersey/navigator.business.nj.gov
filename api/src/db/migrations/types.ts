import { type CryptoClient } from "@domain/types";

export interface MigrationClients {
  cryptoClient: CryptoClient;
  legacyTaxIdCryptoClient?: CryptoClient;
  newHashingClient?: CryptoClient;
}
