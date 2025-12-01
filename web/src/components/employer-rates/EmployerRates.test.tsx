import { EmployerRates } from "@/components/employer-rates/EmployerRates";
import {
  generateBusiness,
  generateEmployerRatesResponse,
  generateProfileData,
  generateUser,
  generateUserDataForBusiness,
  getMergedConfig,
  OperatingPhaseId,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTheme, ThemeProvider } from "@mui/material";
import * as api from "@/lib/api-client/apiClient";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { DOL_EIN_CHARACTERS } from "@/components/data-fields/DolEin";

jest.mock("@businessnjgovnavigator/shared/dateHelpers", () => {
  const actual = jest.requireActual("@businessnjgovnavigator/shared/dateHelpers");
  const dayjsMod = jest.requireActual("dayjs");
  const realDayjs = dayjsMod.default || dayjsMod;
  return {
    ...actual,
    getCurrentDate: jest.fn(() => realDayjs("2023-10-01")),
  };
});

const Config = getMergedConfig();
const originalOpen = window.open;

jest.mock("@/lib/api-client/apiClient", () => ({
  checkEmployerRates: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

describe("EmployerRates", () => {
  let dateNowSpy: jest.SpyInstance<number, []>;

  beforeAll(() => {
    dateNowSpy = jest
      .spyOn(Date, "now")
      .mockReturnValue(new Date("2024-10-01T00:00:00Z").getTime());
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.open = originalOpen;
  });

  afterAll(() => {
    dateNowSpy.mockRestore();
  });

  let userData: UserData;

  const renderComponents = (overrides?: Partial<ProfileData>): void => {
    const profileData = generateProfileData(overrides ?? {});
    const business = generateBusiness({ profileData });
    userData = generateUserDataForBusiness(business, {
      user: generateUser({ id: business.userId, email: "test@msn.com" }),
    });
    render(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulUserData initialUserData={userData}>
          <WithStatefulProfileData initialData={profileData}>
            <EmployerRates />
          </WithStatefulProfileData>
        </WithStatefulUserData>
      </ThemeProvider>,
    );
  };

  const OWNING_BASE = {
    operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
    businessPersona: "OWNING" as const,
  };

  const renderComponentsWithOwning = (overrides?: Partial<ProfileData>): void => {
    renderComponents({ ...OWNING_BASE, ...overrides });
  };

  it("renders for up and running operating phase for starting persona", () => {
    renderComponents({
      operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
      businessPersona: "STARTING",
    });
    expect(screen.getByText(Config.employerRates.sectionHeaderText)).toBeInTheDocument();
  });

  it("renders for up and running operating phase for foreign persona", () => {
    renderComponents({
      operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
      businessPersona: "FOREIGN",
    });
    expect(screen.getByText(Config.employerRates.sectionHeaderText)).toBeInTheDocument();
  });

  it("renders for up and running owning operating phase", () => {
    renderComponents({
      operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
      businessPersona: "OWNING",
    });
    expect(screen.getByText(Config.employerRates.sectionHeaderText)).toBeInTheDocument();
  });

  describe("employerAccessRegistration Input", () => {
    it("does not have a default value for employerAccessRegistration when undefined", () => {
      renderComponentsWithOwning({
        employerAccessRegistration: undefined,
      });

      const falseRadio = screen.getByRole("radio", {
        name: Config.employerRates.employerAccessFalseText,
      });
      const trueRadio = screen.getByRole("radio", {
        name: Config.employerRates.employerAccessTrueText,
      });
      expect(falseRadio).not.toBeChecked();
      expect(trueRadio).not.toBeChecked();
    });

    it("renders false when employerAccessRegistration is false", () => {
      renderComponentsWithOwning({
        employerAccessRegistration: false,
      });

      const falseRadio = screen.getByRole("radio", {
        name: Config.employerRates.employerAccessFalseText,
      });
      expect(falseRadio).toBeChecked();
    });

    it("renders true when employerAccessRegistration is true", () => {
      renderComponentsWithOwning({
        employerAccessRegistration: true,
      });

      const trueRadio = screen.getByRole("radio", {
        name: Config.employerRates.employerAccessTrueText,
      });
      expect(trueRadio).toBeChecked();
    });
  });

  it("opens link when clicking the employerAccessNoButtonText button", async () => {
    (window as Window & typeof globalThis).open = jest.fn();
    renderComponentsWithOwning({
      employerAccessRegistration: false,
    });

    const button = screen.getByRole("button", {
      name: Config.employerRates.employerAccessNoButtonText,
    });

    await userEvent.click(button);

    expect(window.open).toHaveBeenCalledWith(
      Config.employerRates.employerAccessNoButtonLink,
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("renders button that calls api", async () => {
    renderComponentsWithOwning({
      employerAccessRegistration: true,
    });

    await waitFor(() => {
      expect(
        screen.getByText(Config.employerRates.employerAccessYesButtonText),
      ).toBeInTheDocument();
    });
  });

  it("renders input error and alert when pressing submit with empty DOL EIN", async () => {
    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "",
    });

    const button = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.click(button);
    expect(await screen.findByText(Config.employerRates.dolEinErrorText)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("limits DOL EIN input to DOL_EIN_CHARACTERS", async () => {
    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "",
    });

    const textbox = screen.getByRole("textbox");
    const user = userEvent.setup();
    const toType = "1".repeat(DOL_EIN_CHARACTERS + 1);
    await user.type(textbox, toType);

    expect((textbox as HTMLInputElement).value.length).toBe(DOL_EIN_CHARACTERS);
  });

  it("renders input error and alert when entering less than DOL_EIN_CHARACTERS and blurring", async () => {
    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "",
    });

    const textbox = screen.getByRole("textbox");
    const user = userEvent.setup();
    const toType = "1".repeat(DOL_EIN_CHARACTERS - 1);
    await user.type(textbox, toType);
    await user.tab();

    expect(await screen.findByText(Config.employerRates.dolEinErrorText)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("clears input error and alert when input is cleared and blurred", async () => {
    renderComponentsWithOwning({
      employerAccessRegistration: true,
    });

    const textbox = screen.getByRole("textbox");
    const user = userEvent.setup();

    await user.clear(textbox);
    await user.type(textbox, "1".repeat(DOL_EIN_CHARACTERS - 1));
    await user.tab();

    expect(await screen.findByText(Config.employerRates.dolEinErrorText)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.clear(textbox);
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(Config.employerRates.dolEinErrorText)).not.toBeInTheDocument();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("removes alert after clicking false/no radio button", async () => {
    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "",
    });

    const submit = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    await userEvent.click(submit);

    expect(await screen.findByRole("alert")).toBeInTheDocument();

    const falseRadio = screen.getByRole("radio", {
      name: Config.employerRates.employerAccessFalseText,
    });
    await userEvent.click(falseRadio);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls checkEmployerRates endpoint", async () => {
    mockApi.checkEmployerRates.mockRejectedValue(new Error("500"));

    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "123451234512345",
      businessName: "Test Business",
    });

    const submit = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    await userEvent.click(submit);

    expect(mockApi.checkEmployerRates).toHaveBeenCalledWith({
      employerRates: {
        ein: "123451234512345",
        businessName: "Test Business",
        email: "test@msn.com",
        qtr: 4,
        year: 2024,
      },
      userData: userData,
    });
  });

  it("renders a server error alert when the api call fails", async () => {
    mockApi.checkEmployerRates.mockRejectedValue(new Error("500"));

    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "123451234512345",
      businessName: "Test Business",
    });

    const submit = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    await userEvent.click(submit);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("serverError")).toBeInTheDocument();
  });

  it("removes server error when radio selection changes", async () => {
    mockApi.checkEmployerRates.mockRejectedValue(new Error("500"));

    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "123451234512345",
      businessName: "Test Business",
    });

    const submit = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    await userEvent.click(submit);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("serverError")).toBeInTheDocument();

    const falseRadio = screen.getByRole("radio", {
      name: Config.employerRates.employerAccessFalseText,
    });
    await userEvent.click(falseRadio);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("removes server error when there is a dol ein error", async () => {
    mockApi.checkEmployerRates.mockRejectedValue(new Error("500"));

    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "123451234512345",
      businessName: "Test Business",
    });

    const submit = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    await userEvent.click(submit);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("serverError")).toBeInTheDocument();

    const textbox = screen.getByRole("textbox");
    const user = userEvent.setup();
    user.clear(textbox);
    const toType = "1".repeat(DOL_EIN_CHARACTERS - 1);
    await user.type(textbox, toType);
    await user.tab();

    expect(await screen.findByText(Config.employerRates.dolEinErrorText)).toBeInTheDocument();
    expect(screen.queryByTestId("serverError")).not.toBeInTheDocument();
  });

  it("renders noAccount error when checkEmployerRates returns an error string", async () => {
    mockApi.checkEmployerRates.mockResolvedValue(
      generateEmployerRatesResponse({
        error: "some error",
      }),
    );

    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "123451234512345",
      businessName: "Test Business",
    });

    const submit = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    await userEvent.click(submit);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("noAccountError")).toBeInTheDocument();
  });

  it("removes noAccount error when radio selection changes", async () => {
    mockApi.checkEmployerRates.mockResolvedValue(
      generateEmployerRatesResponse({
        error: "some error",
      }),
    );

    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "123451234512345",
      businessName: "Test Business",
    });

    const submit = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    await userEvent.click(submit);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("noAccountError")).toBeInTheDocument();

    const falseRadio = screen.getByRole("radio", {
      name: Config.employerRates.employerAccessFalseText,
    });
    await userEvent.click(falseRadio);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("removes noAccount error when there is a dol ein error", async () => {
    mockApi.checkEmployerRates.mockResolvedValue(
      generateEmployerRatesResponse({
        error: "some error",
      }),
    );

    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "123451234512345",
      businessName: "Test Business",
    });

    const submit = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    await userEvent.click(submit);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("noAccountError")).toBeInTheDocument();

    const textbox = screen.getByRole("textbox");
    const user = userEvent.setup();
    user.clear(textbox);
    const toType = "1".repeat(DOL_EIN_CHARACTERS - 1);
    await user.type(textbox, toType);
    await user.tab();

    expect(await screen.findByText(Config.employerRates.dolEinErrorText)).toBeInTheDocument();
    expect(screen.queryByTestId("noAccountError")).not.toBeInTheDocument();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("removes the question and shows the success tables on successful response", async () => {
    mockApi.checkEmployerRates.mockResolvedValue(
      generateEmployerRatesResponse({
        error: "",
      }),
    );

    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "123451234512345",
      businessName: "Test Business",
    });

    const submit = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    await userEvent.click(submit);

    expect(screen.getByRole("alert", { name: "success" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Quarterly Contribution Rates" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Total Contribution Rates" })).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: Config.employerRates.employerAccessHeaderText }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: Config.employerRates.employerAccessYesButtonText }),
    ).not.toBeInTheDocument();
  });

  it("goes back to the question view if user edits quarter", async () => {
    mockApi.checkEmployerRates.mockResolvedValue(
      generateEmployerRatesResponse({
        error: "",
      }),
    );

    renderComponentsWithOwning({
      employerAccessRegistration: true,
      deptOfLaborEin: "123451234512345",
      businessName: "Test Business",
    });

    const submit = await screen.findByRole("button", {
      name: Config.employerRates.employerAccessYesButtonText,
    });

    await userEvent.click(submit);

    expect(screen.getByRole("alert", { name: "success" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Quarterly Contribution Rates" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Total Contribution Rates" })).toBeInTheDocument();

    const editQuarter = screen.getByRole("button", {
      name: Config.employerRates.editQuarterButtonText,
    });

    await userEvent.click(editQuarter);
    expect(screen.queryByRole("alert", { name: "success" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("table", { name: "Quarterly Contribution Rates" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("table", { name: "Total Contribution Rates" }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: Config.employerRates.employerAccessHeaderText }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: Config.employerRates.employerAccessYesButtonText }),
    ).toBeInTheDocument();
  });
});
