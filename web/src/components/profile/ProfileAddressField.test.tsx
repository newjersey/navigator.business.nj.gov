import { ProfileAddressField} from "@/components/profile/ProfileAddressField";
import {Address, createEmptyAddress} from "@businessnjgovnavigator/shared/userData";
import {render, screen} from "@testing-library/react";
import {FormContextType} from "@/contexts/formContext";
import {ProfileFields, ReducedFieldStates} from "@/lib/types/types";
import { AddressContext } from "@/contexts/addressContext";
import {generateAddress} from "@businessnjgovnavigator/shared/test";

describe("<ProfileAddressField  />", () => {

    const renderComponent = (address: Address): void => {
      render(
        <AddressContext.Provider
          value={{
            state: {
              addressData: address,
              interactedFields: [],
              formContextState: {} as FormContextType<ReducedFieldStates<ProfileFields, unknown>, unknown>,
            },
          }}
        >
          <ProfileAddressField/>
        </AddressContext.Provider>
      );
  };

  describe("profile address field", () => {
    it("shows content the profile address field", () => {
      const address = generateAddress({
        addressLine1: "abcdefghijklmnopqrstuvwxyz12345678910",
        addressZipCode: "08367",
        businessLocationType: "NJ",
      });
      renderComponent(address);

      //expect(screen.getByText(task.contentMd)).toBeInTheDocument();
    });
  });
});
