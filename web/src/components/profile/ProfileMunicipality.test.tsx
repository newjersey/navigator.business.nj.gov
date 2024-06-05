import { ProfileMunicipality } from "@/components/profile/ProfileMunicipality";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import { generateFormationNJAddress } from "@businessnjgovnavigator/shared/test";
import { Address, createEmptyAddress } from "@businessnjgovnavigator/shared/userData";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<ProfileMunicipality  />", () => {
  const renderComponent = (addressData?: Address): void => {
    render(
      <WithStatefulAddressData initialData={addressData || createEmptyAddress()}>
        <ProfileMunicipality />
      </WithStatefulAddressData>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("when rendering a profile municipality dropdown", () => {
    it("rendering profile municipality dropdown", () => {
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
    });

    it("rendering profile municipality dropdown when clicked value changes", () => {
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
    });
  });
});
