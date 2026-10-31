import {
  type FieldErrorType,
  FieldStateActionKind,
  type FormContextType,
} from "@businessnjgovnavigator/shared/types";
import { type Context, use, useEffect, useMemo } from "react";
import { useMountEffect } from "@/lib/utils/helpers";

export const useFormContextFieldHelpers = <T, FieldError = FieldErrorType>(
  fieldName: keyof T,
  context?: Context<FormContextType<T, FieldError>>,
  errorTypes?: FieldError[],
): {
  RegisterForOnSubmit: (isValidFunc: () => boolean, preventRefreshWhenUnmounted?: boolean) => void;
  setIsValid: (isValid: boolean) => void;
  isFormFieldInvalid: boolean;
} => {
  // `use` may be called conditionally (unlike useContext), which keeps useMemo below running on
  // every render whether or not a form context is passed.
  const formContext = context ? use(context) : undefined;
  const fieldInvalid = formContext?.fieldStates[fieldName].invalid;
  const isFormFieldInvalid = useMemo(() => {
    return fieldInvalid === true;
  }, [fieldInvalid]);

  if (!formContext) {
    return {
      RegisterForOnSubmit: (_isValidFunc: () => boolean): void => {},
      setIsValid: (_isValid: boolean): void => {},
      isFormFieldInvalid: false,
    };
  }
  const { runValidations, fieldStates, reducer } = formContext;
  const RegisterForOnSubmit = (
    isValidFunc: () => boolean,
    preventRefreshWhenUnmounted?: boolean,
  ): void => {
    useMountEffect(() => {
      reducer({ type: FieldStateActionKind.REGISTER, payload: { field: fieldName } });

      return (): void => {
        if (!preventRefreshWhenUnmounted) {
          reducer({ type: FieldStateActionKind.UNREGISTER, payload: { field: fieldName } });
        }
      };
    });

    useEffect(() => {
      runValidations &&
        fieldStates[fieldName].updated !== undefined &&
        reducer({
          type: FieldStateActionKind.VALIDATION,
          payload: { field: fieldName, invalid: !isValidFunc(), errorTypes },
        });
    }, [runValidations]);
  };

  const setIsValid = (isValid: boolean): void => {
    reducer({
      type: FieldStateActionKind.VALIDATION,
      payload: { field: fieldName, invalid: !isValid, errorTypes },
    });
  };

  return {
    RegisterForOnSubmit,
    setIsValid,
    isFormFieldInvalid,
  };
};
