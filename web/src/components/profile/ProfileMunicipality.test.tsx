import { ProfileMunicipality } from "@/components/profile/ProfileMunicipality";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import { fetchMunicipalityByName } from "@businessnjgovnavigator/api/src/domain/user/fetchMunicipalityByName";
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
    it("rendering profile municipality dropdown", async () => {
      const municipality = await fetchMunicipalityByName("Aberdeen Township");
      const address = generateFormationNJAddress({
        addressMunicipality: {
          displayName: municipality.townDisplayName,
          name: municipality.townName,
          county: municipality.countyName,
          id: municipality.id,
        },
      });
      renderComponent(address);
      expect(screen.getByLabelText("Address municipality")).toBeInTheDocument();
    });
  });
});
