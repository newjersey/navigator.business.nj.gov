import { FieldStateActionKind, FormContextType } from "@/contexts/formContext";
import { FieldErrorType } from "@/lib/types/types";
import { useMountEffect } from "@/lib/utils/helpers";
import { Context, useContext, useEffect, useMemo } from "react";

const debug = false;

export const useFormContextFieldHelpers = <T, FieldError = FieldErrorType>(
  fieldName: keyof T,
  context?: Context<FormContextType<T, FieldError>>,
  errorTypes?: FieldError[]
): {
  RegisterForOnSubmit: (isValidFunc: () => boolean) => void;
  Validate: (invalid: boolean) => void;
  isFormFieldInValid: boolean;
} => {
  if (!context) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      RegisterForOnSubmit: (isValidFunc: () => boolean) => {},
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Validate: (invalid: boolean) => {},
      isFormFieldInValid: false,
    };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { runValidations, fieldStates, reducer } = useContext(context);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const RegisterForOnSubmit = (isValidFunc: () => boolean) => {
    debug && console.log("register func");
    useMountEffect(() => {
      debug && console.log("mounted");
      debug && console.log(fieldName);
      reducer({ type: FieldStateActionKind.REGISTER, payload: { field: fieldName } });

      return () => {
        debug && console.log("unmounted");
        debug && console.log(fieldName);
        reducer({ type: FieldStateActionKind.UNREGISTER, payload: { field: fieldName } });
      };
    });

    useEffect(() => {
      debug && console.log("validation");
      debug && console.log(runValidations);
      debug && console.log(isValidFunc());
      runValidations &&
        fieldStates[fieldName].updated != undefined &&
        reducer({
          type: FieldStateActionKind.VALIDATION,
          payload: { field: fieldName, invalid: !isValidFunc(), errorTypes },
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [runValidations]);
  };

  const Validate = (invalid: boolean) => {
    debug && console.log("custom validation");
    reducer({
      type: FieldStateActionKind.VALIDATION,
      payload: { field: fieldName, invalid: invalid, errorTypes },
    });
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isFormFieldInValid = useMemo(
    () => {
      return fieldStates[fieldName].invalid === true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fieldStates[fieldName].invalid]
  );

  return {
    RegisterForOnSubmit,
    Validate,
    isFormFieldInValid,
  };
};
