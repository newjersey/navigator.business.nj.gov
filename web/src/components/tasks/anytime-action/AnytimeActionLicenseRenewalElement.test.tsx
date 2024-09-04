import { AnytimeActionLicenseRenewalElement } from "@/components/tasks/anytime-action/AnytimeActionLicenseRenewalElement";
import { getMergedConfig } from "@/contexts/configContext";
import { AnytimeActionLicenseRenewal } from "@/lib/types/types";
import { generateAnytimeActionLicenseRenewal } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import {
  defaultDateFormat,
  licenseSearchDateFormat,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared/";
import { randomElementFromArray } from "@businessnjgovnavigator/shared/arrayHelpers";
import { taskIdLicenseNameMapping } from "@businessnjgovnavigator/shared/license";
import { generateLicenseData, generateLicenseDetails } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
const Config = getMergedConfig();

describe("<AnytimeActionLicenseRenewalElement />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  const renderAnytimeActionLicenseRenewalElement = (overrides?: AnytimeActionLicenseRenewal): void => {
    const anytimeActionLicenseRenewalElement = generateAnytimeActionLicenseRenewal({
      ...overrides,
    });
    render(
      <AnytimeActionLicenseRenewalElement anytimeActionLicenseRenewal={anytimeActionLicenseRenewalElement} />
    );
  };

  it("renders Anytime Action License Renewal Element with Active status", () => {
    const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));

    useMockBusiness({
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            licenseStatus: "ACTIVE",
          }),
        },
      }),
    });

    const anytimeActionLicense = [
      generateAnytimeActionLicenseRenewal({
        name: "some-license-name",
        urlSlug: "some-url",
        filename: "some-filename-license",
        licenseName,
      }),
    ];
    renderAnytimeActionLicenseRenewalElement(anytimeActionLicense[0]);
    expect(screen.getByTestId("permit-ACTIVE")).toBeInTheDocument();
  });

  it("renders Anytime Action License Renewal Element with company name and address", () => {
    const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));
    const licenseAddress = {
      name: "Business Sample",
      addressLine1: "1 Business Way",
      addressLine2: "Suite 10",
      zipCode: "08211",
    };

    useMockBusiness({
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            licenseStatus: "ACTIVE",
            nameAndAddress: {
              ...licenseAddress,
            },
          }),
        },
      }),
    });

    const anytimeActionLicense = [
      generateAnytimeActionLicenseRenewal({
        name: "some-license-name",
        urlSlug: "some-url",
        filename: "some-filename-license",
        licenseName,
      }),
    ];
    const secondLineAddress = licenseAddress.addressLine2 ? ` ${licenseAddress.addressLine2}` : "";
    const address =
      `${licenseAddress.addressLine1}${secondLineAddress}, ${licenseAddress.zipCode} NJ`.toUpperCase();
    renderAnytimeActionLicenseRenewalElement(anytimeActionLicense[0]);
    expect(screen.getByText(licenseAddress.name.toUpperCase())).toBeInTheDocument();
    expect(screen.getByText(address)).toBeInTheDocument();
  });

  it("renders Anytime Action License RenewalElement with last updated date", () => {
    const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));
    const licenseAddress = {
      name: "Business Sample",
      addressLine1: "1 Business Way",
      addressLine2: "Suite 10",
      zipCode: "08211",
    };

    useMockBusiness({
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            licenseStatus: "ACTIVE",
            nameAndAddress: {
              ...licenseAddress,
            },
            lastUpdatedISO: "2018-04-23T10:26:00.996Z",
          }),
        },
      }),
    });

    const anytimeActionLicense = [
      generateAnytimeActionLicenseRenewal({
        name: "some-license-name",
        urlSlug: "some-url",
        filename: "some-filename-license",
        licenseName,
      }),
    ];

    renderAnytimeActionLicenseRenewalElement(anytimeActionLicense[0]);
    expect(
      screen.getByText(
        parseDateWithFormat("2018-04-23T10:26:00.996Z", defaultDateFormat).format(licenseSearchDateFormat)
      )
    ).toBeInTheDocument();
  });

  it("renders Anytime Action License Renewal Element with checklist items", () => {
    const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));
    const licenseAddress = {
      name: "Business Sample",
      addressLine1: "1 Business Way",
      addressLine2: "Suite 10",
      zipCode: "08211",
    };

    useMockBusiness({
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            licenseStatus: "ACTIVE",
            nameAndAddress: {
              ...licenseAddress,
            },
            checklistItems: [{ title: `checklist-title-1`, status: "ACTIVE" }],
            lastUpdatedISO: "2018-04-23T10:26:00.996Z",
          }),
        },
      }),
    });

    const anytimeActionLicense = [
      generateAnytimeActionLicenseRenewal({
        name: "some-license-name",
        urlSlug: "some-url",
        filename: "some-filename-license",
        licenseName,
      }),
    ];

    renderAnytimeActionLicenseRenewalElement(anytimeActionLicense[0]);
    const applicationCheckListItems = screen.getByText(
      Config.licenseSearchTask.applicationChecklistItemsText
    );

    expect(applicationCheckListItems).toBeInTheDocument();
    fireEvent.click(applicationCheckListItems);
    expect(screen.getByText("checklist-title-1")).toBeInTheDocument();
  });
});
