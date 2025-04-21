import fs from "fs";

export const mockReadDirReturn = ({
  value,
  mockedFs,
}: {
  value: string[];
  mockedFs: jest.Mocked<typeof fs>;
}): void => {
  // We should try not to do this; if you do need to disable typescript please include a comment justifying why.
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
  // We should try not to do this; if you do need to disable typescript please include a comment justifying why.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  mockedFs.readdirSync.mockReturnValueOnce(value);
};
