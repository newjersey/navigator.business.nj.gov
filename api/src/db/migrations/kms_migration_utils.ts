import { type MigrationClients } from "@db/migrations/types";
import { ForeignEnvironmentCiphertextError } from "@domain/types";

export interface KmsFieldMigrationResult {
  readonly value: string | undefined;
  readonly wasReset: boolean;
  readonly plaintext?: string;
}

interface RotateKmsFieldParams {
  readonly migrationVersion: number;
  readonly fieldName: string;
  readonly encryptedValue: string | undefined;
  readonly clients: MigrationClients;
}

export const rotateKmsField = async ({
  migrationVersion,
  fieldName,
  encryptedValue,
  clients,
}: RotateKmsFieldParams): Promise<KmsFieldMigrationResult> => {
  if (!encryptedValue) {
    return { value: encryptedValue, wasReset: false };
  }

  let plaintext: string;
  try {
    plaintext = await clients.cryptoClient.decryptValue(encryptedValue);
  } catch (error) {
    if (error instanceof ForeignEnvironmentCiphertextError) {
      clients.logger?.LogInfo?.(
        `Migration v${migrationVersion} reset ${fieldName} because its ciphertext belongs to a foreign environment`,
      );
      return { value: undefined, wasReset: true };
    }

    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Migration v${migrationVersion} failed to decrypt ${fieldName}: ${message}`, {
      cause: error,
    });
  }

  try {
    return {
      value: await clients.cryptoClient.encryptValue(plaintext),
      wasReset: false,
      plaintext,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Migration v${migrationVersion} failed to encrypt ${fieldName}: ${message}`, {
      cause: error,
    });
  }
};
