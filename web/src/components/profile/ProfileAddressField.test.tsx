import { ProfileAddressField } from "@/components/profile/ProfileAddressField";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import { generateFormationNJAddress } from "@businessnjgovnavigator/shared/test";
import { Address } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<ProfileAddressField  />", () => {
  const renderComponent = (address: Address): void => {
    render(
      <WithStatefulAddressData initialData={address}>
        <ProfileAddressField />
      </WithStatefulAddressData>
    );
  };

  describe("profile address field", () => {
    it("render profile address line 1 field with input value", () => {
      const address = generateFormationNJAddress({
        addressLine1: "1111 Home Alone",
        addressMunicipality: {
          displayName: "Newark Display Name",
          name: "Newark",
          county: "some-county-1",
          id: "some-id-1",
        },
      });
      renderComponent(address);
      expect(screen.getByLabelText("Address line1")).toBeInTheDocument();
      expect((screen.getByLabelText("Address line1") as HTMLInputElement).value).toEqual("1111 Home Alone");
    });

    it("profile address line 1 reflects changed value", () => {
      const address = generateFormationNJAddress({
        addressLine1: "1111 Home Alone",
        addressMunicipality: {
          displayName: "Newark Display Name",
          name: "Newark",
          county: "some-county-1",
          id: "some-id-1",
        },
      });
      renderComponent(address);
      const addressField = screen.getByLabelText("Address line1");
      fireEvent.change(addressField, { target: { value: "2222 South Avenue" } });
      expect((screen.getByLabelText("Address line1") as HTMLInputElement).value).toEqual("2222 South Avenue");
    });

    it("render profile address line 2 field with input value", () => {
      const address = generateFormationNJAddress({
        addressLine2: "1111 Home Avenue",
        addressMunicipality: {
          displayName: "Newark Display Name",
          name: "Newark",
          county: "some-county-1",
          id: "some-id-1",
        },
      });
      renderComponent(address);
      expect(screen.getByLabelText("Address line2")).toBeInTheDocument();
      expect((screen.getByLabelText("Address line2") as HTMLInputElement).value).toEqual("1111 Home Avenue");
    });

    it("profile address line 2 reflects changed value", () => {
      const address = generateFormationNJAddress({
        addressLine2: "1111 Home Avenue",
        addressMunicipality: {
          displayName: "Newark Display Name",
          name: "Newark",
          county: "some-county-1",
          id: "some-id-1",
        },
      });
      renderComponent(address);
      const addressField = screen.getByLabelText("Address line2");
      fireEvent.change(addressField, { target: { value: "2222 North Avenue" } });
      expect((screen.getByLabelText("Address line2") as HTMLInputElement).value).toEqual("2222 North Avenue");
    });

    it("render profile address zip code field with input value", () => {
      const address = generateFormationNJAddress({
        addressZipCode: "08437",
        addressMunicipality: {
          displayName: "Newark Display Name",
          name: "Newark",
          county: "some-county-1",
          id: "some-id-1",
        },
      });
      renderComponent(address);
      expect(screen.getByLabelText("Address zip code")).toBeInTheDocument();
      expect((screen.getByLabelText("Address zip code") as HTMLInputElement).value).toEqual("08437");
    });

    it("profile address zip code reflects changed value", () => {
      const address = generateFormationNJAddress({
        addressZipCode: "08437",
        addressMunicipality: {
          displayName: "Newark Display Name",
          name: "Newark",
          county: "some-county-1",
          id: "some-id-1",
        },
      });
      renderComponent(address);
      const addressField = screen.getByLabelText("Address zip code");
      fireEvent.change(addressField, { target: { value: "08123" } });
      expect((screen.getByLabelText("Address zip code") as HTMLInputElement).value).toEqual("08123");
    });

    it("render profile address state field with input value", () => {
      const address = generateFormationNJAddress({
        addressState: { shortCode: "NJ", name: "New Jersey" },
        addressMunicipality: {
          displayName: "Newark Display Name",
          name: "Newark",
          county: "some-county-1",
          id: "some-id-1",
        },
      });

      renderComponent(address);
      expect(screen.getByLabelText("Address state")).toBeInTheDocument();
      expect((screen.getByLabelText("Address state") as HTMLInputElement).value).toEqual("NJ");
    });

    it("render profile address municipality field with input value", () => {
      const address = generateFormationNJAddress({
        addressMunicipality: {
          displayName: "Newark Display Name",
          name: "Newark",
          county: "some-county-1",
          id: "some-id-1",
        },
      });

      renderComponent(address);
      expect(screen.getByLabelText("Address municipality")).toBeInTheDocument();
      expect((screen.getByLabelText("Address municipality") as HTMLInputElement).value).toEqual(
        "Newark Display Name"
      );
    });
  });
});
