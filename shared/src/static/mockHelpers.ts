import type fs from "node:fs";

export const mockReadDirectoryReturn = ({
  value,
  mockedFs,
}: {
  value: string[];
  mockedFs: jest.Mocked<typeof fs>;
}): void => {
  // We should try not to do this; if you do need to disable typescript please include a comment justifying why.
  // @ts-expect-error
  mockedFs.readdirSync.mockReturnValue(value);
};
export const mockReadDirectoryReturnOnce = ({
  value,
  mockedFs,
}: {
  value: string[];
  mockedFs: jest.Mocked<typeof fs>;
}): void => {
  // We should try not to do this; if you do need to disable typescript please include a comment justifying why.
  // @ts-expect-error
  mockedFs.readdirSync.mockReturnValueOnce(value);
};
