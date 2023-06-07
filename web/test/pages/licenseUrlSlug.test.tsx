import { getMergedConfig } from "@/contexts/configContext";
import { LicenseEvent, LicenseEventType } from "@/lib/types/types";
import LicensePage from "@/pages/licenses/[licenseUrlSlug]";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { getCurrentDate, randomInt } from "@businessnjgovnavigator/shared";
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

  const renderLicensePage = (license: LicenseEvent, licenseEventType: LicenseEventType): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <LicensePage license={license} licenseEventType={licenseEventType} />
      </ThemeProvider>
    );
  };

  const generateLicenseEvent = (overrides: Partial<LicenseEvent>): LicenseEvent => {
    const id = randomInt(4);
    return {
      filename: `filename-${id}`,
      title: `License Name ${id}`,
      urlSlug: `url-slug-${id}`,
      callToActionLink: `cta-link-${id}`,
      callToActionText: `cta-text-${id}`,
      contentMd: `content-${id}`,
      ...overrides,
    };
  };

  it("shows the basic expiration details and expiration date", () => {
    const expirationDate = currentDate.add(4, "days");

    useMockUserData({
      licenseData: generateLicenseData({ expirationISO: expirationDate.toISOString() }),
    });

    const license = generateLicenseEvent({
      urlSlug: "license-url-slug-1",
      filename: "filename-1",
      title: "License Name 1",
      callToActionLink: "cta-link-1",
      callToActionText: "cta-text-1",
      contentMd: "content-1",
    });

    renderLicensePage(license, "expiration");

    expect(
      screen.getByText(`License Name 1 ${Config.licenseEventDefaults.expirationTitleLabel}`)
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

    useMockUserData({
      licenseData: generateLicenseData({ expirationISO: expirationDate.toISOString() }),
    });

    const license = generateLicenseEvent({
      urlSlug: "license-url-slug-1",
      filename: "filename-1",
      title: "License Name 1",
      callToActionLink: "cta-link-1",
      callToActionText: "cta-text-1",
      contentMd: "content-1",
    });

    renderLicensePage(license, "renewal");

    expect(
      screen.getByText(`License Name 1 ${Config.licenseEventDefaults.renewalTitleLabel}`)
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
