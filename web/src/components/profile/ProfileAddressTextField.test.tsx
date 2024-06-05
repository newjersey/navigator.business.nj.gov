import { ProfileAddressTextField } from "@/components/profile/ProfileAddressTextField";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import { generateFormationNJAddress } from "@businessnjgovnavigator/shared/test";
import { Address, AddressTextField, createEmptyAddress } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<ProfileAddressTextField  />", () => {
  const renderComponent = (fieldName: AddressTextField, addressData?: Address): void => {
    render(
      <WithStatefulAddressData initialData={addressData || createEmptyAddress()}>
        <ProfileAddressTextField fieldName={fieldName} errorBarType={"ALWAYS"} />
      </WithStatefulAddressData>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("when rendering a profile address text field", () => {
    it("rendering profile text field", () => {
      const addressData = generateFormationNJAddress({
        addressLine1: "1111 Add Avenue",
      });
      renderComponent("addressLine1", addressData);
      expect(screen.getByLabelText("Address line1")).toBeInTheDocument();
      expect((screen.getByLabelText("Address line1") as HTMLInputElement).value).toEqual("1111 Add Avenue");
    });

    it("reflecting text field change", () => {
      const addressData = generateFormationNJAddress({
        addressLine1: "1111 Add Avenue",
      });
      renderComponent("addressLine1", addressData);
      const addressField = screen.getByLabelText("Address line1");
      fireEvent.change(addressField, { target: { value: "2222 South Avenue" } });
      expect((screen.getByLabelText("Address line1") as HTMLInputElement).value).toEqual("2222 South Avenue");
    });
  });
});
