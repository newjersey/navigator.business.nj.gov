// RemoveBusinessModal.test.tsx
import { render, screen } from "@testing-library/react";
import { RemoveBusinessContext } from "@/contexts/removeBusinessContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { RemoveBusinessModal } from "./RemoveBusinessModal";
import {useConfig} from "@/lib/data-hooks/useConfig";
import {getMergedConfig} from "@businessnjgovnavigator/shared/contexts";

jest.mock("@/lib/data-hooks/useUserData");

describe("RemoveBusinessModal", () => {
  const setShowRemoveBusinessModal = jest.fn();
  const Config = getMergedConfig();


  const renderModal = (show = true, businessName?: string) => {
    (useUserData as jest.Mock).mockReturnValue({
      business: businessName
        ? {taxFilingData: {businessName}}
        : {taxFilingData: {}},
    });

    return render(
      <RemoveBusinessContext.Provider
        value={{showRemoveBusinessModal: show, setShowRemoveBusinessModal}}
      >
        <RemoveBusinessModal />
      </RemoveBusinessContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders when showRemoveBusinessModal is true", () => {
    renderModal(true, "Lively Bakery");
    expect(screen.getByText(Config.removeBusinessModal.header)).toBeInTheDocument();
    expect(screen.getByText(Config.removeBusinessModal.agreementCheckboxText)).toBeInTheDocument();
    expect(screen.getByText(Config.removeBusinessModal.removeBusinessButtonText)).toBeInTheDocument();
    expect(screen.getByText(Config.removeBusinessModal.cancelButtonText)).toBeInTheDocument();

  });
});
