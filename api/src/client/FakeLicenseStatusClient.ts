import { LicenseEntity } from "@shared/license";
import AWS from "aws-sdk";
import { LicenseStatusClient } from "../domain/types";

export const FakeLicenseStatusClient = (): LicenseStatusClient => {
  const search = async (): Promise<LicenseEntity[]> => {
    const S3 = new AWS.S3();
    try {
      const data = await S3.getObject({
        Bucket: "data-fixture",
        Key: "license-status-response.json",
      }).promise();
      if (!data.Body) {
        return Promise.reject();
      }

      return JSON.parse(data.Body.toString("utf-8")) as LicenseEntity[];
    } catch (e) {
      console.log("S3 error", e);
      return Promise.reject();
    }
  };

  return {
    search,
  };
};
