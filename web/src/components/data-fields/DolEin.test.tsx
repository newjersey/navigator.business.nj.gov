import { render, screen } from "@testing-library/react";
import { DolEin } from "@/components/data-fields/DolEin";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { generateProfileData } from "@businessnjgovnavigator/shared/test/factories";
import { formatDolEin } from "@/lib/domain-logic/formatDolEin";
import userEvent from "@testing-library/user-event";
import * as api from "@/lib/api-client/apiClient";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";

jest.mock("@/lib/api-client/apiClient", () => ({
  decryptValue: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const Config = getMergedConfig();

describe("<DolEin />", () => {
  const formattedHiddenEin = formatDolEin("*".repeat(15));

  beforeEach(() => {
    jest.resetAllMocks();
  });

  interface Props {
    startHidden?: boolean;
    editable?: boolean;
  }
  const renderComponent = (profileData?: ProfileData, props?: Props): void => {
    render(
      <WithStatefulProfileData initialData={profileData || createEmptyProfileData()}>
        <DolEin value={undefined} startHidden={props?.startHidden} editable={props?.editable} />
      </WithStatefulProfileData>,
    );
  };

  it("starts visible if no prop.startHidden is provided", () => {
    const einValue = "123456789012345";
    renderComponent(generateProfileData({ deptOfLaborEin: einValue }), { editable: true });
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.hideButtonText,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.showButtonText,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toHaveValue(formatDolEin(einValue));
  });

  it("starts hidden if startHidden is true", () => {
    const einValue = "123456789012345";
    renderComponent(generateProfileData({ deptOfLaborEin: einValue }), {
      startHidden: true,
      editable: true,
    });
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.showButtonText,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.hideButtonText,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toHaveValue(formattedHiddenEin);
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toBeDisabled();
  });

  it("toggles between hidden and shown when button is pressed", async () => {
    const einValue = "123456789012345";
    renderComponent(generateProfileData({ deptOfLaborEin: einValue }), { editable: true });
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.hideButtonText,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.showButtonText,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toHaveValue(formatDolEin(einValue));
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toBeEnabled();

    await userEvent.click(
      screen.getByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.hideButtonText,
      }),
    );
    expect(
      screen.getByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.showButtonText,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.hideButtonText,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toHaveValue(formattedHiddenEin);
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toBeDisabled();
  });

  it("decrypts einValue if it is filled out in userData on first render", async () => {
    const einValue = "123456789012345";
    const decryptedEinValue = "111111111111111";
    mockApi.decryptValue.mockResolvedValue(decryptedEinValue);
    renderComponent(generateProfileData({ deptOfLaborEin: einValue }), {
      startHidden: true,
      editable: true,
    });
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toHaveValue(formattedHiddenEin);
    await userEvent.click(
      screen.getByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.showButtonText,
      }),
    );
    expect(mockApi.decryptValue).toHaveBeenCalledWith({ encryptedValue: einValue });
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toHaveValue(
      formatDolEin(decryptedEinValue),
    );
  });

  it("does not decrypt on first render if userData has no einValue", async () => {
    const einValue = "";
    renderComponent(generateProfileData({ deptOfLaborEin: einValue }), {
      editable: true,
    });
    expect(screen.getByRole("textbox", { name: "Dol ein" })).toHaveValue("");
    expect(
      screen.getByRole("button", {
        name: Config.profileDefaults.fields.deptOfLaborEin.default.hideButtonText,
      }),
    ).toBeInTheDocument();
    expect(mockApi.decryptValue).not.toHaveBeenCalled();
  });

  it("renders as a span if field is disabled", async () => {
    const einValue = "123456789012345";
    renderComponent(generateProfileData({ deptOfLaborEin: einValue }), {
      startHidden: true,
      editable: false,
    });
    expect(screen.queryByRole("textbox", { name: "Dol ein" })).not.toBeInTheDocument();
    expect(screen.getByText(formattedHiddenEin)).toBeInTheDocument();

    renderComponent(generateProfileData({ deptOfLaborEin: einValue }), {
      startHidden: false,
      editable: false,
    });
    expect(screen.queryByRole("textbox", { name: "Dol ein" })).not.toBeInTheDocument();
    expect(screen.getByText(formatDolEin(einValue))).toBeInTheDocument();
  });
});
