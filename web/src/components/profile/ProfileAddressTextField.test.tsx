import { ProfileAddressTextField} from "@/components/profile/ProfileAddressTextField";
import { WithStatefulAddressData } from "@/test/mock/withStatefulAddressData";
import {render} from "@testing-library/react";
import {generateAddress } from "@businessnjgovnavigator/shared/test";
import {Address, createEmptyAddress} from "@businessnjgovnavigator/shared/userData";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<ProfileAddressTextField  />", () => {
  const renderComponent = (addressData?: Address): void => {
    render(
      <WithStatefulAddressData initialData={addressData|| createEmptyAddress()}>
        <ProfileAddressTextField/>
      </WithStatefulAddressData>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("when rendering a profile address text field", () => {
    it("rendering profile address text field ", () => {
      const addressData = generateAddress({
        addressLine1: ""
      });
      renderComponent(addressData);
      //  expect(screen.getByTestId("addressTextField-addressLine1")).toBeInTheDocument();
    });
  });
});
