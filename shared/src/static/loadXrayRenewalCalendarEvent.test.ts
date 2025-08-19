import fs from "fs";
import { loadXrayRenewalCalendarEvent } from "./loadXrayRenewalCalendarEvent";
import { mockReadDirectoryReturn } from "./mockHelpers";

jest.mock("fs");
jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadRenewalCalendarEvents", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadXrayRenewalCalendarEvent", () => {
    it("returns the xray renewal event", () => {
      const xrayRenewal =
        "---\n" +
        'urlSlug: "xray-renewal"\n' +
        'callToActionLink: "callToAction.com"\n' +
        'callToActionText: "Call to Action Text"\n' +
        'contentMd: "xray renewal content"\n' +
        "---\n";

      mockedFs.readFileSync.mockReturnValueOnce(xrayRenewal);

      mockReadDirectoryReturn({ value: ["xray-renewal.md"], mockedFs });
      const xrayRenewalCalendarEvent = loadXrayRenewalCalendarEvent();

      expect(xrayRenewalCalendarEvent).toEqual({
        callToActionLink: "callToAction.com",
        callToActionText: "Call to Action Text",
        contentMd: "xray renewal content",
        filename: "xray-renewal",
        urlSlug: "xray-renewal",
      });
    });
  });
});
