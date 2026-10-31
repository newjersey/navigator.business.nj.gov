import { render, screen } from "@testing-library/react";
import { type ReactElement, useState } from "react";
import {
  createDataFormErrorMap,
  type DataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";

// Real fields call their own hooks after this one, so a change in this hook's hook count
// shifts theirs. The trailing useState stands in for them.
const FieldValidity = ({ withContext }: { withContext: boolean }): ReactElement => {
  const { isFormFieldInvalid } = useFormContextFieldHelpers<DataFormErrorMap>(
    "businessName",
    withContext ? DataFormErrorMapContext : undefined,
  );
  const [suffix] = useState(" field");
  return <div>{`${isFormFieldInvalid ? "invalid" : "valid"}${suffix}`}</div>;
};

const renderInForm = (withContext: boolean): ReactElement => (
  <DataFormErrorMapContext.Provider
    value={{
      fieldStates: { ...createDataFormErrorMap(), businessName: { invalid: true } },
      runValidations: false,
      reducer: (): void => {},
    }}
  >
    <FieldValidity withContext={withContext} />
  </DataFormErrorMapContext.Provider>
);

describe("useFormContextFieldHelpers", () => {
  it("reads the field's validity from the context when one is given", () => {
    render(renderInForm(true));
    expect(screen.getByText("invalid field")).toBeInTheDocument();
  });

  it("reports the field as valid when no context is given", () => {
    render(renderInForm(false));
    expect(screen.getByText("valid field")).toBeInTheDocument();
  });

  it("keeps working when the context is added after the first render", () => {
    const { rerender } = render(renderInForm(false));
    rerender(renderInForm(true));
    expect(screen.getByText("invalid field")).toBeInTheDocument();
  });

  it("keeps working when the context is removed after the first render", () => {
    const { rerender } = render(renderInForm(true));
    rerender(renderInForm(false));
    expect(screen.getByText("valid field")).toBeInTheDocument();
  });
});
