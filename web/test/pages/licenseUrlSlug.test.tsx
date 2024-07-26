import { getMergedConfig } from "@/contexts/configContext";
import { LicenseEventType } from "@/lib/types/types";
import LicensePage from "@/pages/licenses/[licenseUrlSlug]";
import { generateLicenseEvent } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import {
  generateLicenseDetails,
  getCurrentDate,
  LicenseEventSubtype,
  randomElementFromArray,
} from "@businessnjgovnavigator/shared";
import { taskIdToLicenseName } from "@businessnjgovnavigator/shared/";
import { generateLicenseData } from "@businessnjgovnavigator/shared/test";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
const Config = getMergedConfig();

const currentDate = getCurrentDate();

describe("license page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderLicensePage = (license: LicenseEventType, licenseEventType: LicenseEventSubtype): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <LicensePage license={license} licenseEventType={licenseEventType} />
      </ThemeProvider>
    );
  };

  it("shows the basic expiration details and expiration date", () => {
    const expirationDate = currentDate.add(4, "days");
    const licenseName = randomElementFromArray(Object.values(taskIdToLicenseName));
    const license = generateLicenseEvent({
      licenseName,
      urlSlug: "license-url-slug-1",
      filename: "filename-1",
      callToActionLink: "cta-link-1",
      callToActionText: "cta-text-1",
      contentMd: "content-1",
    });

    useMockBusiness({
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            expirationDateISO: expirationDate.toISOString(),
          }),
        },
      }),
    });

    renderLicensePage(license, "expiration");

    expect(
      screen.getByText(`${licenseName} ${Config.licenseEventDefaults.expirationTitleLabel}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.licenseEventDefaults.beforeExpirationDateText.toUpperCase())
    ).toBeInTheDocument();
    expect(screen.getByText("cta-text-1")).toBeInTheDocument();
    expect(screen.getByText("content-1")).toBeInTheDocument();
    expect(screen.getByText(Config.licenseEventDefaults.disclaimerMarkdown)).toBeInTheDocument();
    expect(screen.getByText(expirationDate.format("MMMM D, YYYY"), { exact: false })).toBeInTheDocument();
  });

  it("shows the basic renewal details and renewal date", () => {
    const expirationDate = currentDate.add(4, "days");

    const licenseName = randomElementFromArray(Object.values(taskIdToLicenseName));
    const license = generateLicenseEvent({
      licenseName,
      urlSlug: "license-url-slug-1",
      filename: "filename-1",
      callToActionLink: "cta-link-1",
      callToActionText: "cta-text-1",
      contentMd: "content-1",
    });

    useMockBusiness({
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            expirationDateISO: expirationDate.toISOString(),
          }),
        },
      }),
    });

    renderLicensePage(license, "renewal");

    expect(
      screen.getByText(`${licenseName} ${Config.licenseEventDefaults.renewalTitleLabel}`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.licenseEventDefaults.beforeRenewalDateText.toUpperCase())
    ).toBeInTheDocument();
    expect(screen.getByText("cta-text-1")).toBeInTheDocument();
    expect(screen.getByText("content-1")).toBeInTheDocument();
    expect(screen.getByText(Config.licenseEventDefaults.disclaimerMarkdown)).toBeInTheDocument();
    expect(
      screen.getByText(expirationDate.add(30, "days").format("MMMM D, YYYY"), { exact: false })
    ).toBeInTheDocument();
  });
});
