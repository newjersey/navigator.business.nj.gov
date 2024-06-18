import { ProfileNewJerseyAddress } from "@/components/profile/ProfileNewJerseyAddress";
import { getMergedConfig } from "@/contexts/configContext";
import { generateAddress } from "@/test/factories";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import { Address, emptyAddressData, Municipality } from "@businessnjgovnavigator/shared/";
import { generateMunicipality } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, within } from "@testing-library/react";

const Config = getMergedConfig();

describe("<ProfileNewJerseyAddress  />", () => {
  const renderComponent = ({
    address,
    municipalities,
  }: {
    address?: Address;
    municipalities?: Municipality[];
  }): void => {
    render(
      <WithStatefulAddressData
        initialData={address || emptyAddressData}
        municipalities={municipalities || [generateMunicipality({})]}
      >
        <ProfileNewJerseyAddress />
      </WithStatefulAddressData>
    );
  };

  it("render profile address line 1 field with input value", () => {
    const address = generateAddress({
      addressLine1: "1111 Home Alone",
    });
    renderComponent({ address });
    expect(screen.getByLabelText("Address line1")).toHaveValue("1111 Home Alone");
  });

  it("render profile address line 1 reflects changed value", () => {
    const address = generateAddress({
      addressLine1: "",
    });
    renderComponent({ address });
    expect(screen.getByLabelText("Address line1")).toHaveValue("");
    fillText("Address line1", "1111 Home Alone");
    expect(screen.getByLabelText("Address line1")).toHaveValue("1111 Home Alone");
  });

  it("renders profile address line 1 error", () => {
    const address = generateAddress({
      addressLine1: "",
    });
    renderComponent({ address });
    blurInput("Address line1");
    expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
  });

  it("render profile address line 2 field with input value", () => {
    const address = generateAddress({
      addressLine2: "1111 Home Alone",
    });
    renderComponent({ address });
    expect(screen.getByLabelText("Address line2")).toHaveValue("1111 Home Alone");
  });

  it("render profile address line 2 reflects changed value", () => {
    const address = generateAddress({
      addressLine2: "",
    });
    renderComponent({ address });
    expect(screen.getByLabelText("Address line2")).toHaveValue("");
    fillText("Address line2", "1111 Home Alone");
    expect(screen.getByLabelText("Address line2")).toHaveValue("1111 Home Alone");
  });

  it("renders profile address line 2 error", () => {
    const address = generateAddress({
      ...emptyAddressData,
      addressLine2: "123",
    });
    renderComponent({ address });
    blurInput("Address line2");
    expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
    expect(screen.getByText(Config.formation.fields.addressMunicipality.error)).toBeInTheDocument();
    expect(screen.getByText(Config.formation.fields.addressZipCode.error)).toBeInTheDocument();
  });

  it("render profile address zip code field with input value", () => {
    const address = generateAddress({
      addressZipCode: "08437",
    });
    renderComponent({ address });
    expect(screen.getByLabelText("Address zip code")).toHaveValue("08437");
  });

  it("render profile address zip code reflects changed value", () => {
    const address = generateAddress({
      addressZipCode: "",
    });
    renderComponent({ address });
    expect(screen.getByLabelText("Address zip code")).toHaveValue("");
    fillText("Address zip code", "08437");
    expect(screen.getByLabelText("Address zip code")).toHaveValue("08437");
  });

  it("updates profile address state field with new jersey value", () => {
    const address = generateAddress({
      addressState: undefined,
    });
    renderComponent({
      address,
    });
    expect(screen.getByLabelText("Address state")).toHaveValue("NJ");
    expect(screen.getByLabelText("Address state")).toBeDisabled();
  });

  it("renders profile zip code error", () => {
    const address = generateAddress({
      addressZipCode: "",
    });
    renderComponent({ address });
    blurInput("Address zip code");
    expect(screen.getByText(Config.formation.fields.addressZipCode.error)).toBeInTheDocument();
  });

  it("renders disabled profile address state field", () => {
    renderComponent({});
    expect(screen.getByLabelText("Address state")).toBeDisabled();
  });

  it("render profile address municipality field with input value", async () => {
    const municipality = generateMunicipality({ displayName: "Newark Display Name", name: "Newark" });
    const address = generateAddress({
      addressMunicipality: municipality,
    });
    renderComponent({
      address,
      municipalities: [municipality],
    });
    expect(screen.getByLabelText("Address municipality")).toHaveValue("Newark Display Name");
  });

  it("render profile address municipality field reflects changed value", async () => {
    const municipality = generateMunicipality({ displayName: "Newark Display Name", name: "Newark" });
    const address = generateAddress({
      addressMunicipality: undefined,
    });
    renderComponent({
      address,
      municipalities: [municipality],
    });
    selectByText("Address municipality", "Newark Display Name");
    expect(screen.getByLabelText("Address municipality")).toHaveValue("Newark Display Name");
  });

  it("render profile address municipality error", async () => {
    const municipality = generateMunicipality({ displayName: "Newark Display Name", name: "Newark" });
    const address = generateAddress({
      addressMunicipality: undefined,
    });
    renderComponent({
      address,
      municipalities: [municipality],
    });
    blurInput("Address municipality");
    expect(screen.getByText(Config.formation.fields.addressMunicipality.error)).toBeInTheDocument();
  });
});

const selectByText = (label: string, value: string): void => {
  fireEvent.mouseDown(screen.getByLabelText(label));
  const listbox = within(screen.getByRole("listbox"));
  fireEvent.click(listbox.getByText(value));
};

const fillText = (label: string, value: string): void => {
  const item = screen.getByLabelText(label);
  fireEvent.change(item, { target: { value: value } });
  fireEvent.blur(item);
};

const blurInput = (label: string): void => {
  const item = screen.getByLabelText(label);
  fireEvent.blur(item);
};
