import { FieldStateActionKind } from "@businessnjgovnavigator/shared/types";
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
const Field = ({ withContext }: { withContext: boolean }): ReactElement => {
  const { RegisterForOnSubmit, isFormFieldInvalid } = useFormContextFieldHelpers<DataFormErrorMap>(
    "businessName",
    withContext ? DataFormErrorMapContext : undefined,
  );
  RegisterForOnSubmit((): boolean => true);
  const [suffix] = useState(" field");
  return <div>{`${isFormFieldInvalid ? "invalid" : "valid"}${suffix}`}</div>;
};

const renderInForm = (withContext: boolean, reducer: jest.Mock = jest.fn()): ReactElement => (
  <DataFormErrorMapContext.Provider
    value={{
      fieldStates: { ...createDataFormErrorMap(), businessName: { invalid: true } },
      runValidations: false,
      reducer,
    }}
  >
    <Field withContext={withContext} />
  </DataFormErrorMapContext.Provider>
);

const registerAction = {
  type: FieldStateActionKind.REGISTER,
  payload: { field: "businessName" },
};
const unregisterAction = {
  type: FieldStateActionKind.UNREGISTER,
  payload: { field: "businessName" },
};

describe("useFormContextFieldHelpers", () => {
  it("reads the field's validity from the context when one is given", () => {
    render(renderInForm(true));
    expect(screen.getByText("invalid field")).toBeInTheDocument();
  });

  it("reports the field as valid when no context is given", () => {
    render(renderInForm(false));
    expect(screen.getByText("valid field")).toBeInTheDocument();
  });

  it("registers the field when the context is added after the first render", () => {
    const reducer = jest.fn();
    const { rerender } = render(renderInForm(false, reducer));

    rerender(renderInForm(true, reducer));
    expect(screen.getByText("invalid field")).toBeInTheDocument();
    expect(reducer.mock.calls).toEqual([[registerAction]]);
  });

  it("unregisters the field when the context is removed after the first render", () => {
    const reducer = jest.fn();
    const { rerender } = render(renderInForm(true, reducer));

    rerender(renderInForm(false, reducer));
    expect(screen.getByText("valid field")).toBeInTheDocument();
    expect(reducer.mock.calls).toEqual([[registerAction], [unregisterAction]]);
  });

  it("skips validation for a field the form has not registered yet", () => {
    const reducer = jest.fn();
    render(
      <DataFormErrorMapContext.Provider
        value={{
          fieldStates: { ...createDataFormErrorMap(), businessName: { invalid: false } },
          runValidations: true,
          reducer,
        }}
      >
        <Field withContext={true} />
      </DataFormErrorMapContext.Provider>,
    );

    expect(reducer.mock.calls).toEqual([[registerAction]]);
  });
});
