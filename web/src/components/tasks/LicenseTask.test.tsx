import { LicenseTask } from "@/components/tasks/LicenseTask";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { generateLicenseTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  Business,
  createEmptyLicenseSearchNameAndAddress,
  generateBusiness,
  generateLicenseData,
  generateLicenseSearchNameAndAddress,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import { generateLicenseDetails, taskIdLicenseNameMapping } from "@businessnjgovnavigator/shared/";
import {
  generateFormationData,
  generateFormationFormData,
  generateFormationSubmitResponse,
  generateLicenseStatusItem,
} from "@businessnjgovnavigator/shared/test";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ checkLicenseStatus: jest.fn(), getUserData: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

const Config = getMergedConfig();

describe("<LicenseTask />", () => {
  const task = generateLicenseTask({});

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
    useMockBusiness(generateBusiness({}));
    useMockRoadmap({});
    jest.useFakeTimers();
  });

  describe("task status checkbox", () => {
    it("task status checkbox is editable when lastUpdatedISO is empty", async () => {
      setupStatefulUserDataContext();
      const business = generateBusiness({
        taskProgress: { [task.id]: "IN_PROGRESS" },
        licenseData: generateLicenseData(
          {},
          { [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({ lastUpdatedISO: "" }) }
        ),
      });
      renderTaskWithStatefulData(business);
      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      await waitFor(() => {
        expect(screen.getByTestId("COMPLETED")).toBeInTheDocument();
      });
      expect(screen.queryByTestId("NOT_STARTED")).not.toBeInTheDocument();
      expect(screen.queryByTestId("IN_PROGRESS")).not.toBeInTheDocument();
      expect(screen.queryByTestId("status-info-tooltip")).not.toBeInTheDocument();
    });

    it("task status checkbox is not editable when lastUpdatedISO has a value", () => {
      setupStatefulUserDataContext();
      const business = generateBusiness({
        taskProgress: { [task.id]: "IN_PROGRESS" },
        licenseData: generateLicenseData(
          {},
          { [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({}) }
        ),
      });
      renderTaskWithStatefulData(business);
      expect(screen.getByTestId("IN_PROGRESS")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("change-task-progress-checkbox"));
      expect(screen.getByTestId("IN_PROGRESS")).toBeInTheDocument();
      expect(screen.getByTestId("status-info-tooltip")).toBeInTheDocument();
      expect(screen.queryByTestId("COMPLETED")).not.toBeInTheDocument();
    });
  });

  describe("on first tab (content tab)", () => {
    it("shows content on first tab when license data is undefined", () => {
      useMockBusiness({ licenseData: undefined });
      renderTask();
      expect(screen.getByText(task.contentMd)).toBeInTheDocument();
    });

    it("shows content on first tab when lastUpdatedISO is empty", () => {
      useMockBusiness({
        licenseData: generateLicenseData(
          {},
          { [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({ lastUpdatedISO: "" }) }
        ),
      });
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

    it("starts on application tab when lastUpdatedISO is empty and visits status tab by clicking secondary button", () => {
      useMockBusiness({
        licenseData: generateLicenseData(
          {},
          {
            [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
              nameAndAddress: generateLicenseSearchNameAndAddress({
                name: "My Cool Nail Salon",
              }),
              lastUpdatedISO: "",
            }),
          }
        ),
      });
      renderTask();
      fireEvent.click(screen.getByTestId("cta-secondary"));
      expect(getValue("business-name")).toEqual("My Cool Nail Salon");
    });

    it("starts on application tab when no licenseData and visits status tab by clicking second tab button", () => {
      useMockBusiness({ licenseData: undefined });
      renderTask();
      expect(screen.queryByTestId("business-name")).not.toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.licenseSearchTask.tab2Text));
      expect(screen.getByTestId("business-name")).toBeInTheDocument();
    });

    it("starts on application tab when lastUpdatedISO is empty and visits status tab by second tab button", () => {
      useMockBusiness({
        licenseData: generateLicenseData(
          {},
          {
            [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
              nameAndAddress: generateLicenseSearchNameAndAddress({
                name: "My Cool Nail Salon",
              }),
              lastUpdatedISO: "",
            }),
          }
        ),
      });
      renderTask();
      fireEvent.click(screen.getByText(Config.licenseSearchTask.tab2Text));
      expect(getValue("business-name")).toEqual("My Cool Nail Salon");
    });
  });

  describe("on second tab (search tab)", () => {
    describe("auto-fill address values", () => {
      it("auto-fills name and address values from license details in user data", async () => {
        useMockBusiness({
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                nameAndAddress: generateLicenseSearchNameAndAddress({
                  name: "Applebees",
                  addressLine1: "123 Main St",
                  addressLine2: "Apt 1",
                  zipCode: "12345",
                }),
                lastUpdatedISO: "",
              }),
            }
          ),
        });
        renderTask();
        fireEvent.click(screen.getByText(Config.licenseSearchTask.tab2Text));

        await waitFor(() => {
          expect(getValue("business-name")).toEqual("Applebees");
        });
        expect(getValue("address-1")).toEqual("123 Main St");
        expect(getValue("address-2")).toEqual("Apt 1");
        expect(getValue("zipcode")).toEqual("12345");
      });

      it("pre-populates form values from formation data when no licenseData and formation is successful", async () => {
        useMockBusiness({
          licenseData: undefined,
          formationData: generateFormationData({
            formationResponse: generateFormationSubmitResponse({
              success: true,
            }),
            formationFormData: generateFormationFormData({
              businessName: "Apple Pies Rock",
              addressLine1: "327 Bakery Lane",
              addressLine2: "Suite E",
              addressZipCode: "12345",
            }),
          }),
        });
        renderTask();
        fireEvent.click(screen.getByTestId("cta-secondary"));

        await waitFor(() => {
          expect(getValue("business-name")).toEqual("Apple Pies Rock");
        });
        expect(getValue("address-1")).toEqual("327 Bakery Lane");
        expect(getValue("address-2")).toEqual("Suite E");
        expect(getValue("zipcode")).toEqual("12345");
      });

      it("pre-populates form values from formation data when lastUpdatedISO in licenseData is empty and name and address fields are empty and formation is successful", async () => {
        useMockBusiness({
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                lastUpdatedISO: "",
                nameAndAddress: createEmptyLicenseSearchNameAndAddress(),
              }),
            }
          ),
          formationData: generateFormationData({
            formationResponse: generateFormationSubmitResponse({
              success: true,
            }),
            formationFormData: generateFormationFormData({
              businessName: "Apple Pies Rock",
              addressLine1: "327 Bakery Lane",
              addressLine2: "Suite E",
              addressZipCode: "12345",
            }),
          }),
        });
        renderTask();
        fireEvent.click(screen.getByTestId("cta-secondary"));

        await waitFor(() => {
          expect(getValue("business-name")).toEqual("Apple Pies Rock");
        });
        expect(getValue("address-1")).toEqual("327 Bakery Lane");
        expect(getValue("address-2")).toEqual("Suite E");
        expect(getValue("zipcode")).toEqual("12345");
      });

      it("auto-fills business name from profile data when no licenseData and formation response is not successful", async () => {
        useMockBusiness({
          profileData: generateProfileData({
            businessName: "Applebees",
          }),
          licenseData: undefined,
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              addressLine1: "123 Honeybee Lane",
              addressLine2: "Suite BB",
              addressZipCode: "12345",
            }),
            formationResponse: generateFormationSubmitResponse({
              success: false,
            }),
          }),
        });

        renderTask();
        fireEvent.click(screen.getByTestId("cta-secondary"));
        await waitFor(() => {
          expect(getValue("business-name")).toEqual("Applebees");
        });
        expect(getValue("address-1")).toEqual("123 Honeybee Lane");
        expect(getValue("address-2")).toEqual("Suite BB");
        expect(getValue("zipcode")).toEqual("12345");
      });

      it("auto-fills business name from profile data when lastUpdatedISO in licenseData is empty and formation response is not successful", async () => {
        useMockBusiness({
          profileData: generateProfileData({
            businessName: "Applebees",
          }),
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                lastUpdatedISO: "",
                nameAndAddress: createEmptyLicenseSearchNameAndAddress(),
              }),
            }
          ),
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              addressLine1: "123 Honeybee Lane",
              addressLine2: "Suite BB",
              addressZipCode: "12345",
            }),
            formationResponse: generateFormationSubmitResponse({
              success: false,
            }),
          }),
        });

        renderTask();
        fireEvent.click(screen.getByTestId("cta-secondary"));
        await waitFor(() => {
          expect(getValue("business-name")).toEqual("Applebees");
        });
        expect(getValue("address-1")).toEqual("123 Honeybee Lane");
        expect(getValue("address-2")).toEqual("Suite BB");
        expect(getValue("zipcode")).toEqual("12345");
      });
    });

    describe("license search", () => {
      it("goes directly to license detail receipt screen and shows data from licenseData when lastUpdatedISO is a non empty string", () => {
        useMockBusiness({
          taskProgress: { [task.id]: "COMPLETED" },
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                licenseStatus: "ACTIVE",
                lastUpdatedISO: "not empty string",
              }),
            }
          ),
        });
        renderTask();

        expect(screen.getByTestId("permit-ACTIVE")).toBeInTheDocument();
        expect(mockApi.checkLicenseStatus).not.toHaveBeenCalled();
      });

      it("submits license status search with name, address and task id", async () => {
        mockApi.checkLicenseStatus.mockResolvedValue(
          generateUserDataForBusiness(
            generateBusiness({
              licenseData: generateLicenseData(
                {},
                {
                  [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                    licenseStatus: "DRAFT",
                  }),
                }
              ),
            })
          )
        );

        setupStatefulUserDataContext();
        const business = generateBusiness({
          taskProgress: { [task.id]: "IN_PROGRESS" },
          licenseData: generateLicenseData(
            {},
            { [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({ lastUpdatedISO: "" }) }
          ),
        });
        renderTaskWithStatefulData(business);

        fireEvent.click(screen.getByText(Config.licenseSearchTask.tab2Text));
        fillText("business-name", "My Cool Nail Salon");
        fillText("address-1", "123 Main St");
        fillText("address-2", "Suite 1");
        fillText("zipcode", "12345");
        fireEvent.submit(screen.getByTestId("check-status-submit"));
        await waitFor(() => {
          expect(screen.getByText("Draft")).toBeInTheDocument();
        });
        expect(mockApi.checkLicenseStatus).toHaveBeenCalledWith(
          {
            name: "My Cool Nail Salon",
            addressLine1: "123 Main St",
            addressLine2: "Suite 1",
            zipCode: "12345",
          },
          task.id
        );
      });
    });

    describe("error alert", () => {
      it("does not display error alerts (NOT_FOUND, FIELDS_REQUIRED, and SEARCH_FAILED) when license status is found", async () => {
        useMockBusiness({
          profileData: generateProfileData({ businessName: "" }),
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                lastUpdatedISO: "",
                nameAndAddress: createEmptyLicenseSearchNameAndAddress(),
              }),
            }
          ),
          formationData: generateFormationData({
            formationResponse: generateFormationSubmitResponse({
              success: false,
            }),
          }),
        });

        mockApi.checkLicenseStatus.mockResolvedValue(
          generateUserDataForBusiness(
            generateBusiness({
              licenseData: generateLicenseData(
                {},
                {
                  [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                    licenseStatus: "PENDING",
                    nameAndAddress: generateLicenseSearchNameAndAddress({
                      name: "Applebees",
                      addressLine1: "123 Main St",
                      addressLine2: "Apt 1",
                      zipCode: "12345",
                    }),
                  }),
                }
              ),
            })
          )
        );
        renderTask();
        fireEvent.click(screen.getByText(Config.licenseSearchTask.tab2Text));
        fillText("business-name", "My Cool Nail Salon");
        fillText("address-1", "123 Main St");
        fillText("address-2", "Suite 1");
        fillText("zipcode", "12345");
        fireEvent.submit(screen.getByTestId("check-status-submit"));
        await waitFor(() => {
          expect(screen.getByTestId("licenseDetailReceipt")).toBeInTheDocument();
        });
        expect(screen.getByText("Pending")).toBeInTheDocument();
        expect(screen.queryByTestId("error-alert-NOT_FOUND")).not.toBeInTheDocument();
        expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
        expect(screen.queryByTestId("error-alert-FIELDS_REQUIRED")).not.toBeInTheDocument();
      });

      it("displays NOT_FOUND error alert when license status cannot be found", async () => {
        useMockBusiness({
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                lastUpdatedISO: "",
              }),
            }
          ),
        });
        renderTask();
        fireEvent.click(screen.getByText(Config.licenseSearchTask.tab2Text));
        expect(screen.queryByTestId("error-alert-NOT_FOUND")).not.toBeInTheDocument();
        mockApi.checkLicenseStatus.mockResolvedValue(
          generateUserDataForBusiness(
            generateBusiness({
              licenseData: generateLicenseData(
                {},
                {
                  [taskIdLicenseNameMapping[task.id]]: {},
                }
              ),
            })
          )
        );
        fireEvent.submit(screen.getByTestId("check-status-submit"));
        await waitFor(() => {
          expect(screen.getByTestId("error-alert-NOT_FOUND")).toBeInTheDocument();
        });
      });

      it("displays SEARCH_FAILED error alert when license status search fails", async () => {
        useMockBusiness({
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                lastUpdatedISO: "",
              }),
            }
          ),
        });
        renderTask();
        fireEvent.click(screen.getByTestId("cta-secondary"));
        mockApi.checkLicenseStatus.mockRejectedValue(500);
        expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
        fireEvent.submit(screen.getByTestId("check-status-submit"));
        await waitFor(() => {
          expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
        });
      });

      it("displays FIELDS_REQUIRED error alert when some information is missing", async () => {
        useMockBusiness({
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                lastUpdatedISO: "",
                nameAndAddress: createEmptyLicenseSearchNameAndAddress(),
              }),
            }
          ),
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              addressLine1: "",
              addressLine2: "",
              addressZipCode: "",
            }),
          }),
        });
        renderTask();
        fireEvent.click(screen.getByText(Config.licenseSearchTask.tab2Text));
        expect(screen.queryByTestId("error-alert-FIELDS_REQUIRED")).not.toBeInTheDocument();
        fireEvent.submit(screen.getByTestId("check-status-submit"));
        await waitFor(() => {
          expect(screen.getByTestId("error-alert-FIELDS_REQUIRED")).toBeInTheDocument();
        });
        expect(mockApi.checkLicenseStatus).not.toHaveBeenCalled();
      });
    });

    describe("receipt screen", () => {
      it("displays license status results when it is found", async () => {
        useMockBusiness({
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                lastUpdatedISO: "",
              }),
            }
          ),
        });
        mockApi.checkLicenseStatus.mockResolvedValue(
          generateUserDataForBusiness(
            generateBusiness({
              licenseData: generateLicenseData(
                {},
                {
                  [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                    licenseStatus: "PENDING",
                    checklistItems: [
                      generateLicenseStatusItem({ title: "application fee", status: "PENDING" }),
                      generateLicenseStatusItem({ title: "board approval", status: "ACTIVE" }),
                    ],
                  }),
                }
              ),
            })
          )
        );
        renderTask();
        fireEvent.click(screen.getByText(Config.licenseSearchTask.tab2Text));
        await waitFor(() => {
          expect(screen.getByTestId("check-status-submit")).toBeInTheDocument();
        });
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
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                nameAndAddress: generateLicenseSearchNameAndAddress({
                  name: "My Cool Nail Salon",
                  addressLine1: "123 Main St",
                  addressLine2: "Suite 1",
                  zipCode: "12345",
                }),
              }),
            }
          ),
        });
        renderTask();
        fireEvent.click(screen.getByText(Config.licenseSearchTask.tab2Text));
        expect(screen.getByText("My Cool Nail Salon".toUpperCase())).toBeInTheDocument();
        expect(screen.getByText("123 Main St Suite 1, 12345 NJ")).toBeInTheDocument();
      });
    });

    describe("edit button", () => {
      it("displays check license status screen when edit button is clicked on receipt screen", () => {
        useMockBusiness({
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({}),
            }
          ),
        });

        renderTask();
        fireEvent.click(screen.getByTestId("edit-button"));
        expect(screen.getByTestId("business-name")).toBeInTheDocument();
      });
    });

    describe("permit status", () => {
      it("displays Active when permit status is ACTIVE", async () => {
        useMockBusiness({
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                licenseStatus: "ACTIVE",
                checklistItems: [generateLicenseStatusItem({ title: "application fee", status: "ACTIVE" })],
              }),
            }
          ),
        });
        renderTask();
        expect(screen.getByText("application fee")).toBeInTheDocument();
        expect(screen.getByTestId("item-ACTIVE")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
      });

      it("displays Active when permit status is PENDING", async () => {
        useMockBusiness({
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                licenseStatus: "PENDING",
                checklistItems: [generateLicenseStatusItem({ title: "Application", status: "PENDING" })],
              }),
            }
          ),
        });
        renderTask();

        expect(screen.getByText("Application")).toBeInTheDocument();
        expect(screen.getByTestId("item-PENDING")).toBeInTheDocument();

        const permitStatusElement = screen.getAllByText("Pending")[0] as HTMLElement;
        expect(permitStatusElement).toHaveTextContent("Pending");
      });

      it("displays Active when permit status is EXPIRED", async () => {
        useMockBusiness({
          licenseData: generateLicenseData(
            {},
            {
              [taskIdLicenseNameMapping[task.id]]: generateLicenseDetails({
                licenseStatus: "EXPIRED",
                checklistItems: [generateLicenseStatusItem({ title: "application fee", status: "ACTIVE" })],
              }),
            }
          ),
        });
        renderTask();
        expect(screen.getByText("application fee")).toBeInTheDocument();
        expect(screen.getByTestId("item-ACTIVE")).toBeInTheDocument();
        expect(screen.getByText("Expired")).toBeInTheDocument();
      });
    });
  });

  const fillText = (testid: string, value: string): void => {
    fireEvent.change(screen.getByTestId(testid), { target: { value: value } });
  };

  const getValue = (testid: string): string => {
    return (screen.getByTestId(testid) as HTMLInputElement)?.value;
  };
});
