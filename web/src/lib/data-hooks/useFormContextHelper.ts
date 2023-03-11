import { FieldStateActionKind, FormContextReducer, FormContextType } from "@/contexts/formContext";
import { FieldErrorType, FieldStatus, ReducedFieldStates } from "@/lib/types/types";
import { FormEvent, useCallback, useEffect, useReducer, useState } from "react";

export const useFormContextHelper = <
  T extends ReducedFieldStates<keyof T, FieldError>,
  Tab = unknown,
  FieldError = Exclude<T[keyof T]["errorTypes"], undefined>[number]
>(
  initState: T,
  tabs?: Tab[],
  initTab?: Tab
): {
  FormFuncWrapper: (
    onSubmitFunc: () => void | Promise<void>,
    onErrorFunc?: () => void | Promise<void>
  ) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  onTabChange: (tab: Tab) => void;
  isValid: () => boolean;
  getErrors: () => FieldError[];
  tab: Tab;
  state: FormContextType<T>;
} => {
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [tab, setTab] = useState<Tab>(initTab ?? (tabs ? tabs[0] : (0 as Tab)));
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

  const [fieldStates, fieldStateDispatch] = useReducer<FormContextReducer<T>>(fieldStatesReducer, initState);

  const FormFuncWrapper: (
    onSubmitFunc: () => void | Promise<void>,
    onErrorFunc?: () => void | Promise<void>
  ) => void = (onSubmitFunc, onErrorFunc) => {
    useEffect(() => {
      if (submitted || stagingTab) {
        const stillNeedsUpdates = Object.values(fieldStates).some(
          (k) => (k as FieldStatus<FieldErrorType>).updated === false
        );
        if (!stillNeedsUpdates) {
          if (isValid()) {
            if (submitted) {
              onSubmitFunc();
            }

            if (stagingTab) {
              setTab(stagingTab);
            }
          } else {
            onErrorFunc && onErrorFunc();
          }
          stagingTab && setStagingTab(undefined);
          setSubmitted(false);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldStates, submitted, stagingTab]);
  };

  const onSubmit = useCallback((event?: FormEvent<HTMLFormElement>): void => {
    event?.preventDefault();
    setSubmitted(true);
  }, []);

  const onTabChange = useCallback((tab: Tab): void => {
    setStagingTab(tab);
  }, []);

  const isValid = (): boolean => {
    const thing = !Object.values(fieldStates).some(
      (k) => (k as FieldStatus<FieldErrorType>).invalid && (k as FieldStatus<FieldErrorType>).updated
    );
    return thing;
  };

  const getErrors = (): FieldError[] =>
    Object.values(fieldStates)
      .filter((k) => (k as FieldStatus<FieldError>).invalid && (k as FieldStatus<FieldError>).updated)
      .flatMap((k) => (k as FieldStatus<FieldError>).errorTypes ?? []);

  return {
    FormFuncWrapper,
    tab,
    onSubmit,
    onTabChange,
    isValid,
    getErrors,
    state: {
      fieldStates,
      runValidations: submitted || stagingTab != undefined,
      reducer: fieldStateDispatch,
    },
  };
};
