import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  act,
  fireEvent,
  render,
  RenderResult,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material";
import * as api from "@/lib/api-client/apiClient";
import {
  generateLicenseData,
  generateLicenseStatusItem,
  generateNameAndAddress,
  generateOnboardingData,
  generateTask,
  generateUserData,
} from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { LicenseTask } from "@/components/tasks/LicenseTask";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ checkLicenseStatus: jest.fn(), getUserData: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

describe("<LicenseTask />", () => {
  let subject: RenderResult;
  const task = generateTask({});
  const initialUserData = generateUserData({ licenseData: generateLicenseData({}) });

  const renderTask = (): RenderResult =>
    render(
      <ThemeProvider theme={createTheme()}>
        <LicenseTask task={task} />
      </ThemeProvider>
    );

  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData(initialUserData);
    useMockRoadmap({});
    mockApi.getUserData.mockResolvedValue(initialUserData);
  });

  it("displays status as an uneditable tag with a tooltip", () => {
    useMockUserData({
      taskProgress: {
        [task.id]: "IN_PROGRESS",
      },
    });
    subject = renderTask();

    fireEvent.click(subject.getByTestId("IN_PROGRESS"));
    expect(subject.queryByTestId("NOT_STARTED")).not.toBeInTheDocument();
    expect(subject.getByTestId("automatic-status-info-tooltip")).toBeInTheDocument();
  });

  describe("starting tab", () => {
    it("shows content on first tab", () => {
      useMockUserData({ licenseData: undefined });
      subject = renderTask();
      expect(subject.getByText(task.contentMd)).toBeInTheDocument();
    });

    it("starts on application tab when no licenseData and visits status tab by clicking secondary button", () => {
      useMockUserData({ licenseData: undefined });
      subject = renderTask();
      expect(subject.queryByTestId("business-name")).not.toBeInTheDocument();

      fireEvent.click(subject.getByTestId("cta-secondary"));
      expect(subject.queryByTestId("business-name")).toBeInTheDocument();
    });

    it("starts on check status form tab when it has form data but incomplete search", () => {
      useMockUserData({
        licenseData: generateLicenseData({
          completedSearch: false,
          nameAndAddress: generateNameAndAddress({
            name: "My Cool Nail Salon",
          }),
        }),
      });

      subject = renderTask();
      expect(getValue("business-name")).toEqual("My Cool Nail Salon");
    });

    it("goes directly to receipt screen and shows data from licenseData when completed search is true", async () => {
      useMockUserData({
        licenseData: generateLicenseData({
          completedSearch: true,
          nameAndAddress: generateNameAndAddress({
            name: "My Cool Nail Salon",
          }),
          status: "ACTIVE",
        }),
      });

      subject = renderTask();

      expect(subject.getByTestId("permit-ACTIVE")).toBeInTheDocument();
      expect(mockApi.checkLicenseStatus).not.toHaveBeenCalled();
    });
  });

  describe("form tab", () => {
    it("fills form values from user data if applicable", () => {
      useMockUserData({
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
      subject = renderTask();

      expect(getValue("business-name")).toEqual("Applebees");
      expect(getValue("address-1")).toEqual("123 Main St");
      expect(getValue("address-2")).toEqual("Apt 1");
      expect(getValue("zipcode")).toEqual("12345");
    });

    it("fills name from user data when no licenseData", () => {
      useMockUserData({
        onboardingData: generateOnboardingData({
          businessName: "Applebees",
        }),
        licenseData: undefined,
      });

      subject = renderTask();
      fireEvent.click(subject.getByTestId("cta-secondary"));

      expect(getValue("business-name")).toEqual("Applebees");
      expect(getValue("address-1")).toEqual("");
      expect(getValue("address-2")).toEqual("");
      expect(getValue("zipcode")).toEqual("");
    });

    it("fills and saves form values and submits license status search with industry", async () => {
      mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));
      subject = renderTask();

      fillText("business-name", "My Cool Nail Salon");
      fillText("address-1", "123 Main St");
      fillText("address-2", "Suite 1");
      fillText("zipcode", "12345");

      fireEvent.submit(subject.getByTestId("check-status-submit"));

      await waitFor(() =>
        expect(mockApi.checkLicenseStatus).toHaveBeenCalledWith({
          name: "My Cool Nail Salon",
          addressLine1: "123 Main St",
          addressLine2: "Suite 1",
          zipCode: "12345",
        })
      );
    });

    it("displays error alert when license status cannot be found", async () => {
      subject = renderTask();
      expect(subject.queryByTestId("error-alert-NOT_FOUND")).not.toBeInTheDocument();

      mockApi.checkLicenseStatus.mockRejectedValue(404);
      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await waitFor(() => expect(subject.queryByTestId("error-alert-NOT_FOUND")).toBeInTheDocument());

      mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));
      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await waitFor(() => expect(subject.queryByTestId("error-alert-NOT_FOUND")).not.toBeInTheDocument());
    });

    it("displays error alert when license status search fails", async () => {
      subject = renderTask();
      expect(subject.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();

      mockApi.checkLicenseStatus.mockRejectedValue(500);
      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await waitFor(() => expect(subject.queryByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument());

      mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));
      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await waitFor(() => expect(subject.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument());
    });

    it("displays error alert when some information is missing", async () => {
      subject = renderTask();
      expect(subject.queryByTestId("error-alert-FIELDS_REQUIRED")).not.toBeInTheDocument();

      fillText("business-name", "");
      fireEvent.submit(subject.getByTestId("check-status-submit"));

      expect(subject.queryByTestId("error-alert-FIELDS_REQUIRED")).toBeInTheDocument();
      expect(subject.queryByTestId("error-alert-not-found")).not.toBeInTheDocument();
      expect(mockApi.checkLicenseStatus).not.toHaveBeenCalled();

      fillText("business-name", "something");
      mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));
      fireEvent.submit(subject.getByTestId("check-status-submit"));

      await waitForElementToBeRemoved(() => subject.queryByTestId("error-alert-FIELDS_REQUIRED"));
      expect(mockApi.checkLicenseStatus).toHaveBeenCalled();
    });

    it("displays the loading spinner while request is being made", async () => {
      const returnedPromise = Promise.resolve(generateUserData({}));
      mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);
      subject = renderTask();

      fillText("business-name", "My Cool Nail Salon");
      fillText("address-1", "123 Main St");
      fillText("zipcode", "12345");

      expect(subject.queryByTestId("loading-spinner")).not.toBeInTheDocument();

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      expect(subject.queryByTestId("loading-spinner")).toBeInTheDocument();
      await act(() => returnedPromise);

      expect(subject.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });

    it("displays the loading spinner while failed request is being made", async () => {
      const returnedPromise = Promise.reject(404);
      mockApi.checkLicenseStatus.mockReturnValue(returnedPromise);
      subject = renderTask();

      fillText("business-name", "My Cool Nail Salon");
      fillText("address-1", "123 Main St");
      fillText("zipcode", "12345");

      expect(subject.queryByTestId("loading-spinner")).not.toBeInTheDocument();

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      expect(subject.queryByTestId("loading-spinner")).toBeInTheDocument();
      await act(() => returnedPromise.catch(() => {}));
      expect(subject.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  describe("receipt screen", () => {
    it("displays license status results when it is found", async () => {
      subject = renderTask();

      mockApi.checkLicenseStatus.mockResolvedValue(
        generateUserData({
          licenseData: generateLicenseData({
            items: [
              generateLicenseStatusItem({ title: "application fee", status: "PENDING" }),
              generateLicenseStatusItem({ title: "board approval", status: "ACTIVE" }),
            ],
          }),
        })
      );

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await waitFor(() => expect(subject.getByText("application fee")).toBeInTheDocument());
      expect(subject.getByText("board approval")).toBeInTheDocument();
      expect(subject.getByTestId("permit-PENDING")).toBeInTheDocument();
      expect(subject.getByTestId("item-PENDING")).toBeInTheDocument();
      expect(subject.getByTestId("item-ACTIVE")).toBeInTheDocument();
    });

    it("displays name and address on receipt screen", async () => {
      useMockUserData({
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

      subject = renderTask();

      expect(subject.getByText("My Cool Nail Salon")).toBeInTheDocument();
      expect(subject.getByText("123 Main St Suite 1, 12345 NJ")).toBeInTheDocument();
    });

    it("edits info on receipt screen", async () => {
      subject = renderTask();

      fillText("business-name", "Some business");
      mockApi.checkLicenseStatus.mockResolvedValue(generateUserData({}));

      fireEvent.submit(subject.getByTestId("check-status-submit"));
      await waitFor(() => fireEvent.click(subject.getByTestId("edit-button")));
      fillText("business-name", "Some Other Business");
    });
  });

  const fillText = (testid: string, value: string) => {
    fireEvent.change(subject.getByTestId(testid), { target: { value: value } });
  };

  const getValue = (testid: string): string => (subject.getByTestId(testid) as HTMLInputElement)?.value;
});
