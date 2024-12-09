import { AddressTextField } from "@/components/data-fields/address/AddressTextField";
import { generateAddress } from "@/test/factories";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import { emptyFormationAddressData, FormationAddress, Municipality } from "@businessnjgovnavigator/shared/";
import { generateMunicipality } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<AddressTextField  />", () => {
  const renderComponent = ({
    fieldName,
    addressData,
    municipalities,
  }: {
    fieldName: keyof FormationAddress;
    addressData?: FormationAddress;
    municipalities?: Municipality[];
  }): void => {
    render(
      <WithStatefulAddressData
        initialData={addressData || emptyFormationAddressData}
        municipalities={municipalities || [generateMunicipality({})]}
      >
        <AddressTextField fieldName={fieldName} errorBarType={"ALWAYS"} />
      </WithStatefulAddressData>
    );
  };

  it("updates the value in the text field", () => {
    renderComponent({ fieldName: "addressLine1" });
    fillText("Address line1", "1234 Main St.");
    expect(screen.getByLabelText("Address line1")).toHaveValue("1234 Main St.");
  });

  it("renders initial value from address data", () => {
    renderComponent({
      fieldName: "addressLine1",
      addressData: generateAddress({ addressLine1: "1234 Main St." }),
    });
    expect(screen.getByLabelText("Address line1")).toHaveValue("1234 Main St.");
  });
});

const fillText = (label: string, value: string): void => {
  const item = screen.getByLabelText(label);
  fireEvent.change(item, { target: { value: value } });
  fireEvent.blur(item);
};
