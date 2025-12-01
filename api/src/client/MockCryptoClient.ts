import { CryptoClient } from "@domain/types";

export class MockCryptoClient implements CryptoClient {
  async encryptValue(value: string): Promise<string> {
    return `encrypted:${value}`;
  }

  async decryptValue(value: string): Promise<string> {
    return value.replace(/^encrypted:/, "");
  }

  async hashValue(value: string): Promise<string> {
    return `hashed:${value}`;
  }
}
