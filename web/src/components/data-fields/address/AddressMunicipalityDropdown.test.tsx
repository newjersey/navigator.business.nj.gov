import { AddressMunicipalityDropdown } from "@/components/data-fields/address/AddressMunicipalityDropdown";
import { generateAddress } from "@/test/factories";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import { emptyFormationAddressData, FormationAddress, Municipality } from "@businessnjgovnavigator/shared/";
import { generateMunicipality } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, within } from "@testing-library/react";

describe("<AddressMunicipalityDropdown  />", () => {
  const renderComponent = ({
    addressData,
    municipalities,
  }: {
    addressData?: FormationAddress;
    municipalities?: Municipality[];
  }): void => {
    render(
      <WithStatefulAddressData
        initialData={addressData || emptyFormationAddressData}
        municipalities={municipalities || [generateMunicipality({})]}
      >
        <AddressMunicipalityDropdown onValidation={() => {}} />
      </WithStatefulAddressData>
    );
  };

  it("selects a municipality from dropdown list", () => {
    renderComponent({ municipalities: [generateMunicipality({ displayName: "display name" })] });
    selectByText("Address municipality", "display name");
    expect(screen.getByLabelText("Address municipality")).toHaveValue("display name");
  });

  it("renders initial value from address data", () => {
    const muni = generateMunicipality({ displayName: "display name" });
    renderComponent({
      addressData: generateAddress({
        addressMunicipality: muni,
      }),
      municipalities: [muni],
    });
    expect(screen.getByLabelText("Address municipality")).toHaveValue("display name");
  });

  const selectByText = (label: string, value: string): void => {
    fireEvent.mouseDown(screen.getByLabelText(label));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };
});
