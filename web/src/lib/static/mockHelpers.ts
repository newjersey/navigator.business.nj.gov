import fs from "fs";

export const mockReadDirReturn = ({
  value,
  mockedFs,
}: {
  value: string[];
  mockedFs: jest.Mocked<typeof fs>;
}): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockedFs.readdirSync.mockReturnValue(value);
};
export const mockReadDirReturnOnce = ({
  value,
  mockedFs,
}: {
  value: string[];
  mockedFs: jest.Mocked<typeof fs>;
}): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockedFs.readdirSync.mockReturnValueOnce(value);
};
