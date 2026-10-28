import {
  type FieldErrorType,
  FieldStateActionKind,
  type FormContextType,
} from "@businessnjgovnavigator/shared/types";
import { type Context, useContext, useEffect, useMemo } from "react";
import { useMountEffect } from "@/lib/utils/helpers";

const debug = false;

export const useFormContextFieldHelpers = <T, FieldError = FieldErrorType>(
  fieldName: keyof T,
  context?: Context<FormContextType<T, FieldError>>,
  errorTypes?: FieldError[],
): {
  RegisterForOnSubmit: (isValidFunc: () => boolean, preventRefreshWhenUnmounted?: boolean) => void;
  setIsValid: (isValid: boolean) => void;
  isFormFieldInvalid: boolean;
} => {
  if (!context) {
    return {
      RegisterForOnSubmit: (_isValidFunc: () => boolean): void => {},
      setIsValid: (_isValid: boolean): void => {},
      isFormFieldInvalid: false,
    };
  }
  const { runValidations, fieldStates, reducer } = useContext(context);
  const RegisterForOnSubmit = (
    isValidFunc: () => boolean,
    preventRefreshWhenUnmounted?: boolean,
  ): void => {
    debug && console.log("register func");
    useMountEffect(() => {
      debug && console.log("mounted");
      debug && console.log(fieldName);
      reducer({ type: FieldStateActionKind.REGISTER, payload: { field: fieldName } });

      return (): void => {
        debug && console.log("unmounted");
        debug && console.log(fieldName);
        if (!preventRefreshWhenUnmounted) {
          reducer({ type: FieldStateActionKind.UNREGISTER, payload: { field: fieldName } });
        }
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
    }, [runValidations]);
  };

  const setIsValid = (isValid: boolean): void => {
    debug && console.log("custom validation");
    reducer({
      type: FieldStateActionKind.VALIDATION,
      payload: { field: fieldName, invalid: !isValid, errorTypes },
    });
  };

  const isFormFieldInvalid = useMemo(() => {
    return fieldStates[fieldName].invalid === true;
  }, [fieldStates[fieldName].invalid]);

  return {
    RegisterForOnSubmit,
    setIsValid,
    isFormFieldInvalid,
  };
};
