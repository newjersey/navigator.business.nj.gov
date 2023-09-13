import { PutObjectCommand, PutObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import axios, { AxiosResponse } from "axios";
import { createHash } from "node:crypto";
import * as https from "node:https";

export const uploadFile = async function (
  fullName: string,
  fileContent: Buffer,
  fileType: string,
  bucket: string
): Promise<PutObjectCommandOutput> {
  const s3 = new S3Client({
    region: "us-east-1",
    requestHandler: new NodeHttpHandler({
      httpsAgent: new https.Agent({
        secureProtocol: "TLSv1_2_method",
      }),
    }),
  });
  const hashSum = createHash("md5");
  hashSum.update(fileContent);
  const params = {
    Key: fullName,
    Body: fileContent,
    Bucket: bucket,
    ContentEncoding: "binary",
    ContentType: fileType,
    ContentMD5: hashSum.digest("base64"),
  };
  const command = new PutObjectCommand(params);
  return s3.send(command);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFileFromURL = async function (URI: string): Promise<AxiosResponse<any, any>> {
  return new Promise((resolve, reject) => {
    try {
      axios
        .get(encodeURI(URI), {
          responseType: "arraybuffer",
        })
        .then((response) => {
          resolve(response);
        });
    } catch (error) {
      reject(error);
    }
  });
};

const escapeColons = (value: string): string => {
  const segments = value.split(":");
  if (segments.length === 1) {
    return value;
  }
  const initial = segments.shift();
  return [initial, segments.join("%3A")].join(":");
};

export const saveFileFromUrl = async function (
  URI: string,
  fullName: string,
  bucket: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    getFileFromURL(URI)
      .then((object) => {
        uploadFile(fullName, object.data, object.headers["content-type"], bucket)
          .then((s3response) => {
            if (s3response.$metadata.httpStatusCode === 200) {
              resolve(escapeColons(`https://${bucket}.s3.us-east-1.amazonaws.com/${fullName}`));
            } else {
              reject(s3response.$metadata.httpStatusCode);
            }
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};
