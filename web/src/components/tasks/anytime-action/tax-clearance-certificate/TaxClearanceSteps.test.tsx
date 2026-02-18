import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { withNeedsAccountContext, withUserDataError } from "@/test/helpers/helpers-renderers";
import { TaxClearanceCertificateData } from "@businessnjgovnavigator/shared/taxClearanceCertificate";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReactElement } from "react";
import { TaxClearanceSteps } from "./TaxClearanceSteps";

describe("TaxClearanceSteps", () => {
  const mockSetShowNeedsAccountModal = jest.fn();

  const mockProps = {
    taxClearanceCertificateData: {} as TaxClearanceCertificateData,
    saveTaxClearanceCertificateData: jest.fn(),
    isValid: jest.fn().mockReturnValue(true),
    getInvalidFieldIds: jest.fn().mockReturnValue([]),
    onSubmit: jest.fn(),
    setCertificatePdfBlob: jest.fn(),
    formFuncWrapper: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockProps.isValid.mockReturnValue(true);
  });

  const DataErrorContextWrapper = ({
    isAuthenticated,
  }: {
    isAuthenticated: IsAuthenticated;
  }): ReactElement => {
    const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());
    return (
      <DataFormErrorMapContext.Provider value={formContextState}>
        {withNeedsAccountContext(
          withUserDataError(<TaxClearanceSteps {...mockProps} />, undefined),
          isAuthenticated,
          {
            setShowNeedsAccountModal: mockSetShowNeedsAccountModal,
            showNeedsAccountModal: false,
            showNeedsAccountSnackbar: false,
            setShowNeedsAccountSnackbar: jest.fn(),
            registrationStatus: undefined,
            setRegistrationStatus: jest.fn(),
          },
        )}
      </DataFormErrorMapContext.Provider>
    );
  };

  const renderWithContext = (isAuthenticated: IsAuthenticated): void => {
    render(<DataErrorContextWrapper isAuthenticated={isAuthenticated} />);
  };

  it("shows modal when clicking step 2 and user is not authenticated", () => {
    renderWithContext(IsAuthenticated.FALSE);

    fireEvent.click(screen.getByTestId("stepper-1"));
    expect(mockSetShowNeedsAccountModal).toHaveBeenCalledWith(true);
  });

  it("shows modal when clicking step 3 and user is not authenticated", () => {
    renderWithContext(IsAuthenticated.FALSE);

    fireEvent.click(screen.getByTestId("stepper-2"));
    expect(mockSetShowNeedsAccountModal).toHaveBeenCalledWith(true);
  });

  it("does not show modal when clicking steps and user is authenticated", () => {
    renderWithContext(IsAuthenticated.TRUE);

    fireEvent.click(screen.getByTestId("stepper-1"));
    expect(mockSetShowNeedsAccountModal).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("stepper-2"));
    expect(mockSetShowNeedsAccountModal).not.toHaveBeenCalled();
  });
});
