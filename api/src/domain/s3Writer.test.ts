import axios from "axios";
import { createHash } from "crypto";
import { saveFileFromUrl } from "./s3Writer";

jest.mock("axios");

const mockAxios = axios as jest.Mocked<typeof axios>;

const mockS3Upload = jest.fn(async () => ({
  $metadata: { httpStatusCode: 200 },
}));

jest.mock("@aws-sdk/client-s3", () => {
  const originalModule = jest.requireActual("@aws-sdk/client-s3");
  return {
    ...originalModule,
    S3Client: jest.fn().mockImplementation(() => ({
      send: mockS3Upload,
    })),
  };
});

describe("s3Writer", () => {
  it("downloads a file and uploads it to a S3 Bucket", async () => {
    const data = Buffer.from("asdasd");
    mockAxios.get.mockImplementation(() =>
      Promise.resolve({ data, headers: { "content-type": "application/pdf" } })
    );
    const hashSum = createHash("md5");
    hashSum.update(data);
    const params = {
      Key: "us-east-1:1234/zzz.pdf",
      Body: data,
      Bucket: "testBucket",
      ContentEncoding: "binary",
      ContentType: "application/pdf",
      ContentMD5: hashSum.digest("base64"),
    };

    const response = await saveFileFromUrl(
      "https://whatever.com/thing.pdf",
      "us-east-1:1234/zzz.pdf",
      "testBucket"
    );
    expect(mockS3Upload).toHaveBeenCalledWith(
      expect.objectContaining({ input: expect.objectContaining(params) })
    );
    expect(response).toEqual("https://testBucket.s3.us-east-1.amazonaws.com/us-east-1%3A1234/zzz.pdf");
    expect(mockAxios.get).toHaveBeenCalledWith("https://whatever.com/thing.pdf", {
      responseType: "arraybuffer",
    });
  });
});
