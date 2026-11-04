import {
  type FieldErrorType,
  FieldStateActionKind,
  type FormContextType,
} from "@businessnjgovnavigator/shared/types";
import { type Context, use, useEffect } from "react";

export const useFormContextFieldHelpers = <T, FieldError = FieldErrorType>(
  fieldName: keyof T,
  context?: Context<FormContextType<T, FieldError>>,
  errorTypes?: FieldError[],
): {
  RegisterForOnSubmit: (isValidFunc: () => boolean, preventRefreshWhenUnmounted?: boolean) => void;
  setIsValid: (isValid: boolean) => void;
  isFormFieldInvalid: boolean;
} => {
  // `use` may be called conditionally, unlike useContext. Every other hook here, including those
  // in RegisterForOnSubmit, runs with or without a form context so the hook count never changes.
  const formContext = context ? use(context) : undefined;
  const isFormFieldInvalid = formContext?.fieldStates[fieldName].invalid === true;

  const RegisterForOnSubmit = (
    isValidFunc: () => boolean,
    preventRefreshWhenUnmounted?: boolean,
  ): void => {
    useEffect(() => {
      formContext?.reducer({ type: FieldStateActionKind.REGISTER, payload: { field: fieldName } });

      return (): void => {
        if (!preventRefreshWhenUnmounted) {
          formContext?.reducer({
            type: FieldStateActionKind.UNREGISTER,
            payload: { field: fieldName },
          });
        }
      };
    }, [context]);

    useEffect(() => {
      formContext?.runValidations &&
        formContext.fieldStates[fieldName].updated !== undefined &&
        formContext.reducer({
          type: FieldStateActionKind.VALIDATION,
          payload: { field: fieldName, invalid: !isValidFunc(), errorTypes },
        });
    }, [formContext?.runValidations]);
  };

  const setIsValid = (isValid: boolean): void => {
    formContext?.reducer({
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
