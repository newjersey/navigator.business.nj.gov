import AWS from "aws-sdk";
import { GetCertHttpsAgent } from "../domain/types";
import https from "https";

export const getMyNJCertsFactory = (awsSecretId: string, passphrase: string): GetCertHttpsAgent => {
  return async (): Promise<https.Agent> => {
    const secretsManager = new AWS.SecretsManager({ region: "us-east-1" });
    try {
      let multilinedCert = "";
      let multilinedKey = "";

      const secretResponse = await secretsManager.getSecretValue({ SecretId: awsSecretId }).promise();
      if (secretResponse.SecretString) {
        const jsonSecret = JSON.parse(secretResponse.SecretString);
        multilinedKey = jsonSecret["MYNJ_CERT_KEY"].replace(/\\n/g, String.fromCharCode(10));
        multilinedCert = jsonSecret["MYNJ_CERT"].replace(/\\n/g, String.fromCharCode(10));
      }

      return Promise.resolve(
        new https.Agent({
          cert: multilinedCert,
          key: multilinedKey,
          passphrase: passphrase,
        })
      );
    } catch (e) {
      return Promise.resolve(
        new https.Agent({
          cert: "",
          key: "",
          passphrase: "",
        })
      );
    }
  };
};
