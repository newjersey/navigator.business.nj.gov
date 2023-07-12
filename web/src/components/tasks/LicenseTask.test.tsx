import { LicenseTask } from "@/components/tasks/LicenseTask";
import * as api from "@/lib/api-client/apiClient";
import { generateTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {useMockBusiness} from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  Business,
  generateBusiness,
  generateLicenseData,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import {
  generateLicenseStatusItem,
  generateNameAndAddress,
  generateUserData,
} from "@businessnjgovnavigator/shared/test";
import { createTheme, ThemeProvider } from "@mui/material";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ checkLicenseStatus: jest.fn(), getUserData: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

describe("<LicenseTask />", () => {
  const task = generateTask({});

  const renderTask = (): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <LicenseTask task={task} />
      </ThemeProvider>
    );
  };

  const renderTaskWithStatefulData = (business: Business): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
          <LicenseTask task={task} />
        </WithStatefulUserData>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness(generateBusiness({}))
    useMockRoadmap({});
    jest.useFakeTimers();
  });

  it("displays status as an editable tag if user has not completed search", () => {
    setupStatefulUserDataContext();
    const business = generateBusiness({
      taskProgress: { [task.id]: "IN_PROGRESS" },
      licenseData: generateLicenseData({
        completedSearch: false,
      }),
    });
    renderTaskWithStatefulData(business);

    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));

    expect(screen.getByTestId("COMPLETED")).toBeInTheDocument();
    expect(screen.queryByTestId("NOT_STARTED")).not.toBeInTheDocument();
    expect(screen.queryByTestId("IN_PROGRESS")).not.toBeInTheDocument();
    expect(screen.queryByTestId("status-info-tooltip")).not.toBeInTheDocument();
  });

  it("displays status as not editable if user has completed search", () => {
    setupStatefulUserDataContext();
    const business = generateBusiness({
      taskProgress: { [task.id]: "IN_PROGRESS" },
      licenseData: generateLicenseData({
        completedSearch: true,
      }),
    });
    renderTaskWithStatefulData(business);
    expect(screen.getByTestId("IN_PROGRESS")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));

    expect(screen.getByTestId("IN_PROGRESS")).toBeInTheDocument();
    expect(screen.getByTestId("status-info-tooltip")).toBeInTheDocument();
    expect(screen.queryByTestId("COMPLETED")).not.toBeInTheDocument();
  });

  describe("starting tab", () => {
    it("shows content on first tab", () => {
      useMockBusiness({ licenseData: undefined });
      renderTask();
      expect(screen.getByText(task.contentMd)).toBeInTheDocument();
    });

    it("starts on application tab when no licenseData and visits status tab by clicking secondary button", () => {
      useMockBusiness({ licenseData: undefined });
      renderTask();
      expect(screen.queryByTestId("business-name")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("cta-secondary"));
      expect(screen.getByTestId("business-name")).toBeInTheDocument();
    });

    it("starts on check status form tab when it has form data but incomplete search", () => {
      useMockBusiness({
        licenseData: generateLicenseData({
          completedSearch: false,
          nameAndAddress: generateNameAndAddress({
            name: "My Cool Nail Salon",
          }),
        }),
      });

      renderTask();
      expect(getValue("business-name")).toEqual("My Cool Nail Salon");
    });

    it("goes directly to receipt screen and shows data from licenseData when completed search is true", () => {
      useMockBusiness({
        licenseData: generateLicenseData({
          completedSearch: true,
          nameAndAddress: generateNameAndAddress({
            name: "My Cool Nail Salon",
          }),
          status: "ACTIVE",
        }),
      });

      renderTask();

      expect(screen.getByTestId("permit-ACTIVE")).toBeInTheDocument();
      expect(mockApi.checkLicenseStatus).not.toHaveBeenCalled();
    });
  });

  describe("form tab", () => {
    it("fills form values from user data if applicable", async () => {
      useMockBusiness({
        licenseData: generateLicenseData({
          nameAndAddress: generateNameAndAddress({
            name: "Applebees",
            addressLine1: "123 Main St",
            addressLine2: "Apt 1",
            zipCode: "12345",
          }),
          completedSearch: false,
        }),
      });
      renderTask();
      await waitFor(() => {
        expect(getValue("business-name")).toEqual("Applebees");
      });
      expect(getValue("address-1")).toEqual("123 Main St");
      expect(getValue("address-2")).toEqual("Apt 1");
      expect(getValue("zipcode")).toEqual("12345");
    });

    it("fills name from user data when no licenseData", async () => {
      useMockBusiness({
        profileData: generateProfileData({
          businessName: "Applebees",
        }),
        licenseData: undefined,
      });

      renderTask();
      fireEvent.click(screen.getByTestId("cta-secondary"));
      await waitFor(() => {
        expect(getValue("business-name")).toEqual("Applebees");
      });
      expect(getValue("address-1")).toEqual("");
      expect(getValue("address-2")).toEqual("");
      expect(getValue("zipcode")).toEqual("");
    });

    it("fills and saves form values and submits license status search with industry", async () => {
      act(() => {
        mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));
      });
      renderTask();

      fillText("business-name", "My Cool Nail Salon");
      fillText("address-1", "123 Main St");
      fillText("address-2", "Suite 1");
      fillText("zipcode", "12345");

      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByText("Pending")).toBeInTheDocument();
      });
      expect(mockApi.checkLicenseStatus).toHaveBeenCalledWith({
        name: "My Cool Nail Salon",
        addressLine1: "123 Main St",
        addressLine2: "Suite 1",
        zipCode: "12345",
      });
    });

    it("displays error alert when license status cannot be found", async () => {
      renderTask();
      expect(screen.queryByTestId("error-alert-NOT_FOUND")).not.toBeInTheDocument();
      mockApi.checkLicenseStatus.mockRejectedValue(404);
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("error-alert-NOT_FOUND")).toBeInTheDocument();
      });
    });

    it("does not display error alert when license status is found", async () => {
      renderTask();

      mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));
      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByText("Pending")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("error-alert-NOT_FOUND")).not.toBeInTheDocument();
    });
  });

  it("displays error alert when license status search fails", async () => {
    renderTask();
    expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();

    mockApi.checkLicenseStatus.mockRejectedValue(500);
    fireEvent.submit(screen.getByTestId("check-status-submit"));
    await waitFor(() => {
      expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
    });
  });

  it("does not display an error alert when license status search passes", async () => {
    renderTask();

    mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));
    fireEvent.submit(screen.getByTestId("check-status-submit"));
    await waitFor(() => {
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
  });

  it("displays error alert when some information is missing", async () => {
    renderTask();
    expect(screen.queryByTestId("error-alert-FIELDS_REQUIRED")).not.toBeInTheDocument();

    fillText("business-name", "");
    fireEvent.submit(screen.getByTestId("check-status-submit"));
    await waitFor(() => {
      expect(screen.getByTestId("error-alert-FIELDS_REQUIRED")).toBeInTheDocument();
    });
    expect(mockApi.checkLicenseStatus).not.toHaveBeenCalled();
  });

  it("does not display an error alert when information is complete", async () => {
    renderTask();
    fillText("business-name", "something");
    mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));
    fireEvent.submit(screen.getByTestId("check-status-submit"));
    await waitFor(() => {
      expect(screen.getByText("Pending")).toBeInTheDocument();
    });
    expect(mockApi.checkLicenseStatus).toHaveBeenCalled();
  });

  it("displays the loading spinner while request is being made", async () => {
    const returnedPromise = Promise.resolve(generateUserData({}));
    mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);
    renderTask();

    fillText("business-name", "My Cool Nail Salon");
    fillText("address-1", "123 Main St");
    fillText("zipcode", "12345");

    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();

    fireEvent.submit(screen.getByTestId("check-status-submit"));
    await waitFor(() => {
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  it("displays the loading spinner while failed request is being made", async () => {
    const returnedPromise = Promise.reject(404);
    mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);
    renderTask();

    fillText("business-name", "My Cool Nail Salon");
    fillText("address-1", "123 Main St");
    fillText("zipcode", "12345");

    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();

    fireEvent.submit(screen.getByTestId("check-status-submit"));
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    await act(() => {
      return returnedPromise.catch(() => {});
    });
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

  describe("receipt screen", () => {
    it("displays license status results when it is found", async () => {
      renderTask();

      mockApi.checkLicenseStatus.mockResolvedValue(
        generateUserDataForBusiness(
          generateBusiness({
            licenseData: generateLicenseData({
              items: [
                generateLicenseStatusItem({title: "application fee", status: "PENDING"}),
                generateLicenseStatusItem({title: "board approval", status: "ACTIVE"}),
              ],
            })
          })
        )
      );

      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByText("application fee")).toBeInTheDocument();
      });
      expect(screen.getByText("board approval")).toBeInTheDocument();
      expect(screen.getByTestId("permit-PENDING")).toBeInTheDocument();
      expect(screen.getByTestId("item-PENDING")).toBeInTheDocument();
      expect(screen.getByTestId("item-ACTIVE")).toBeInTheDocument();
    });

    it("displays name and address on receipt screen", () => {
      useMockBusiness({
        licenseData: generateLicenseData({
          completedSearch: true,
          nameAndAddress: generateNameAndAddress({
            name: "My Cool Nail Salon",
            addressLine1: "123 Main St",
            addressLine2: "Suite 1",
            zipCode: "12345",
          }),
        }),
      });

      renderTask();

      expect(screen.getByText("My Cool Nail Salon")).toBeInTheDocument();
      expect(screen.getByText("123 Main St Suite 1, 12345 NJ")).toBeInTheDocument();
    });

    it("edits info on receipt screen", async () => {
      renderTask();

      fillText("business-name", "Some business");
      mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));

      fireEvent.submit(screen.getByTestId("check-status-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("edit-button")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByTestId("edit-button"));
      fillText("business-name", "Some Other Business");
    });
  });

  const fillText = (testid: string, value: string): void => {
    fireEvent.change(screen.getByTestId(testid), { target: { value: value } });
  };

  const getValue = (testid: string): string => {
    return (screen.getByTestId(testid) as HTMLInputElement)?.value;
  };
});
