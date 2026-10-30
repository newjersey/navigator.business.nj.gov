import {
  type FieldErrorType,
  FieldStateActionKind,
  type FieldStatus,
  type FormContextReducer,
  type FormContextType,
  type ReducedFieldStates,
} from "@businessnjgovnavigator/shared/types";
import { type FormEvent, useCallback, useEffect, useReducer, useState } from "react";

export const useFormContextHelper = <
  T extends ReducedFieldStates<keyof T, FieldError>,
  Tab = unknown,
  FieldError = Exclude<T[keyof T]["errorTypes"], undefined>[number],
>(
  initState: T,
  initTab?: Tab,
): {
  FormFuncWrapper: (
    onSubmitFunc: () => void | Promise<void>,
    onChangeFunc?: (
      isValid: boolean,
      errors: FieldError[],
      pageChange: boolean,
    ) => void | Promise<void>,
  ) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onTabChange: (tab: Tab) => void;
  isValid: () => boolean;
  getErrors: () => FieldError[];
  getInvalidFieldIds: () => string[];
  tab: Tab;
  state: FormContextType<T>;
} => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [tab, setTab] = useState<Tab>(initTab ?? (0 as Tab));
  const [stagingTab, setStagingTab] = useState<Tab | undefined>(undefined);

  const fieldStatesReducer: FormContextReducer<T> = (prevState, action) => {
    const { type, payload } = action;

    switch (type) {
      case FieldStateActionKind.VALIDATION:
        if (Array.isArray(payload.field)) {
          return payload.field.reduce((reducer, field) => {
            reducer[field] = {
              ...reducer[field],
              invalid: payload.invalid,
              updated: true,
              errorTypes: payload.errorTypes,
            };
            return reducer;
          }, prevState);
        }
        return {
          ...prevState,
          [payload.field]: {
            ...prevState[payload.field],
            invalid: payload.invalid,
            updated: true,
            errorTypes: payload.errorTypes,
          },
        };
      case FieldStateActionKind.RESET:
        return (Object.keys(prevState) as (keyof T)[]).reduce((reducer, field) => {
          reducer[field] = { ...reducer[field], updated: undefined };
          return reducer;
        }, prevState);
      case FieldStateActionKind.REGISTER:
        return {
          ...prevState,
          [payload.field]: {
            ...prevState[payload.field],
            updated: false,
          },
        };
      case FieldStateActionKind.UNREGISTER:
        return {
          ...prevState,
          [payload.field]: {
            ...initState[payload.field],
          },
        };
    }
  };

  const [fieldStates, fieldStateDispatch] = useReducer(fieldStatesReducer, initState);

  const getErrors = (): FieldError[] =>
    Object.values(fieldStates)
      .filter(
        (k) => (k as FieldStatus<FieldError>).invalid && (k as FieldStatus<FieldError>).updated,
      )
      .flatMap((k) => (k as FieldStatus<FieldError>).errorTypes ?? []);

  const getInvalidFieldIds = (): string[] => {
    return Object.keys(fieldStates).filter((field) => {
      return fieldStates[field as keyof T].invalid;
    });
  };

  const FormFuncWrapper: (
    onSubmitFunc: () => void | Promise<void>,
    onChangeFunc?: (
      isValid: boolean,
      errors: FieldError[],
      pageChange: boolean,
    ) => void | Promise<void>,
  ) => void = (onSubmitFunc, onChangeFunc) => {
    useEffect(() => {
      const stillNeedsUpdates = Object.values(fieldStates).some(
        (k) => (k as FieldStatus<FieldErrorType>).updated === false,
      );

      const valid = isValid();

      if (onChangeFunc) {
        onChangeFunc && onChangeFunc(valid, getErrors(), submitted || stagingTab !== undefined);
      }

      if (!stillNeedsUpdates) {
        if (valid) {
          if (submitted) {
            onSubmitFunc();
          }

          if (stagingTab) {
            setTab(stagingTab);
          }
        }
        setSubmitted(false);
        stagingTab && setStagingTab(undefined);
      }
    }, [fieldStates, submitted, stagingTab]);
  };

  const onSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>): void => {
      event?.preventDefault();
      !submitted && setSubmitted(true);
    },
    [submitted],
  );

  const onTabChange = useCallback(
    (_tab: Tab): void => {
      if (JSON.stringify(_tab) !== JSON.stringify(tab)) setStagingTab(_tab);
    },
    [tab],
  );

  const isValid = (): boolean => {
    const thing = !Object.values(fieldStates).some(
      (k) =>
        (k as FieldStatus<FieldErrorType>).invalid && (k as FieldStatus<FieldErrorType>).updated,
    );
    return thing;
  };

  return {
    FormFuncWrapper,
    tab,
    onSubmit,
    onTabChange,
    isValid,
    getErrors,
    getInvalidFieldIds,
    state: {
      fieldStates,
      runValidations: submitted || stagingTab !== undefined,
      reducer: fieldStateDispatch,
    },
  };
};
