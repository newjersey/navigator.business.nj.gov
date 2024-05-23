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
  setIsValid: (isValid: boolean) => void;
  isFormFieldInvalid: boolean;
} => {
  if (!context) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      RegisterForOnSubmit: (isValidFunc: () => boolean): void => {},
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setIsValid: (isValid: boolean): void => {},
      isFormFieldInvalid: false,
    };
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { runValidations, fieldStates, reducer } = useContext(context);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const RegisterForOnSubmit = (isValidFunc: () => boolean): void => {
    debug && console.log("register func");
    useMountEffect(() => {
      debug && console.log("mounted");
      debug && console.log(fieldName);
      reducer({ type: FieldStateActionKind.REGISTER, payload: { field: fieldName } });

      return (): void => {
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
        fieldStates[fieldName].updated !== undefined &&
        reducer({
          type: FieldStateActionKind.VALIDATION,
          payload: { field: fieldName, invalid: !isValidFunc(), errorTypes },
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [runValidations]);
  };

  const setIsValid = (isValid: boolean): void => {
    console.log({ isValid });
    debug && console.log("custom validation");
    reducer({
      type: FieldStateActionKind.VALIDATION,
      payload: { field: fieldName, invalid: !isValid, errorTypes },
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
    setIsValid: setIsValid,
    isFormFieldInvalid: isFormFieldInValid,
  };
};
