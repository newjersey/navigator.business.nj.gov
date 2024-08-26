import { getMergedConfig } from "@/contexts/configContext";
import { AnytimeActionLicenseReinstatement } from "@/lib/types/types";
import { generateAnytimeActionLicenseReinstatement } from "@/test/factories";
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
import { AnytimeActionLicenseReinstatementElement } from "./AnytimeActionLicenseReinstatementElement";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
const Config = getMergedConfig();

describe("<AnytimeActionLicenseReinstatementElement />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  const renderAnytimeActionLicenseReinstatementElement = (
    overrides?: AnytimeActionLicenseReinstatement
  ): void => {
    const anytimeActionLicenseReinstatementElement = generateAnytimeActionLicenseReinstatement({
      ...overrides,
    });
    render(
      <AnytimeActionLicenseReinstatementElement
        anytimeActionLicenseReinstatement={anytimeActionLicenseReinstatementElement}
      />
    );
  };

  it("renders Anytime Action License Reinstatement Element with Expired status", () => {
    const licenseName = randomElementFromArray(Object.values(taskIdLicenseNameMapping));

    useMockBusiness({
      licenseData: generateLicenseData({
        licenses: {
          [licenseName]: generateLicenseDetails({
            licenseStatus: "EXPIRED",
          }),
        },
      }),
    });

    const anytimeActionLicense = [
      generateAnytimeActionLicenseReinstatement({
        name: "some-license-name",
        urlSlug: "some-url",
        filename: "some-filename-license",
        licenseName,
      }),
    ];
    renderAnytimeActionLicenseReinstatementElement(anytimeActionLicense[0]);
    expect(screen.getByTestId("permit-EXPIRED")).toBeInTheDocument();
  });

  it("renders Anytime Action License Reinstatement Element with company name and address", () => {
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
            licenseStatus: "EXPIRED",
            nameAndAddress: {
              ...licenseAddress,
            },
          }),
        },
      }),
    });

    const anytimeActionLicense = [
      generateAnytimeActionLicenseReinstatement({
        name: "some-license-name",
        urlSlug: "some-url",
        filename: "some-filename-license",
        licenseName,
      }),
    ];
    const secondLineAddress = licenseAddress.addressLine2 ? ` ${licenseAddress.addressLine2}` : "";
    const address =
      `${licenseAddress.addressLine1}${secondLineAddress}, ${licenseAddress.zipCode} NJ`.toUpperCase();
    renderAnytimeActionLicenseReinstatementElement(anytimeActionLicense[0]);
    expect(screen.getByText(licenseAddress.name.toUpperCase())).toBeInTheDocument();
    expect(screen.getByText(address)).toBeInTheDocument();
  });

  it("renders Anytime Action License Reinstatement Element with last updated date", () => {
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
            licenseStatus: "EXPIRED",
            nameAndAddress: {
              ...licenseAddress,
            },
            lastUpdatedISO: "2018-04-23T10:26:00.996Z",
          }),
        },
      }),
    });

    const anytimeActionLicense = [
      generateAnytimeActionLicenseReinstatement({
        name: "some-license-name",
        urlSlug: "some-url",
        filename: "some-filename-license",
        licenseName,
      }),
    ];

    renderAnytimeActionLicenseReinstatementElement(anytimeActionLicense[0]);
    expect(
      screen.getByText(
        parseDateWithFormat("2018-04-23T10:26:00.996Z", defaultDateFormat).format(licenseSearchDateFormat)
      )
    ).toBeInTheDocument();
  });

  it("renders Anytime Action License Reinstatement Element with checklist items", () => {
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
            licenseStatus: "EXPIRED",
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
      generateAnytimeActionLicenseReinstatement({
        name: "some-license-name",
        urlSlug: "some-url",
        filename: "some-filename-license",
        licenseName,
      }),
    ];

    renderAnytimeActionLicenseReinstatementElement(anytimeActionLicense[0]);
    const applicationCheckListItems = screen.getByText(
      Config.licenseSearchTask.applicationChecklistItemsText
    );

    expect(applicationCheckListItems).toBeInTheDocument();
    fireEvent.click(applicationCheckListItems);
    expect(screen.getByText("checklist-title-1")).toBeInTheDocument();
  });
});
