import { FieldStateActionKind, FormContextReducer, FormContextType } from "@/contexts/formContext";
import { FieldErrorType, FieldStatus, ReducedFieldStates } from "@/lib/types/types";
import { FormEvent, useCallback, useEffect, useReducer, useState } from "react";

const debug = false;

export const useFormContextHelper = <
  T extends ReducedFieldStates<keyof T, FieldError>,
  Tab = unknown,
  FieldError = Exclude<T[keyof T]["errorTypes"], undefined>[number]
>(
  initState: T,
  initTab?: Tab
): {
  FormFuncWrapper: (
    onSubmitFunc: () => void | Promise<void>,
    onChangeFunc?: (isValid: boolean, errors: FieldError[], pageChange: boolean) => void | Promise<void>
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
    debug && console.log(type);
    debug && console.log(payload);
    debug && console.log(prevState);

    switch (type) {
      case FieldStateActionKind.VALIDATION:
        debug && console.log("reducer");
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
  debug && console.log(fieldStates);

  const getErrors = (): FieldError[] =>
    Object.values(fieldStates)
      .filter((k) => (k as FieldStatus<FieldError>).invalid && (k as FieldStatus<FieldError>).updated)
      .flatMap((k) => (k as FieldStatus<FieldError>).errorTypes ?? []);

  const getInvalidFieldIds = (): string[] => {
    return Object.keys(fieldStates).filter((field) => {
      return fieldStates[field as keyof T].invalid;
    });
  };

  const FormFuncWrapper: (
    onSubmitFunc: () => void | Promise<void>,
    onChangeFunc?: (isValid: boolean, errors: FieldError[], pageChange: boolean) => void | Promise<void>
  ) => void = (onSubmitFunc, onChangeFunc) => {
    debug && console.log("wrapper");

    useEffect(() => {
      debug && console.log("submitEffect");

      const stillNeedsUpdates = Object.values(fieldStates).some(
        (k) => (k as FieldStatus<FieldErrorType>).updated === false
      );

      debug && console.log("submitwrapper");

      debug && console.log(1);
      debug && console.log(fieldStates);
      debug && console.log(stillNeedsUpdates);
      debug && console.log(2);

      const valid = isValid();

      if (onChangeFunc) {
        debug && console.log("change func");
        onChangeFunc && onChangeFunc(valid, getErrors(), submitted || stagingTab !== undefined);
      }

      if (stillNeedsUpdates) {
        if (valid) {
          if (submitted) {
            debug && console.log("runs submit");
            onSubmitFunc();
          }

          if (stagingTab) {
            debug && console.log("sets tab");
            setTab(stagingTab);
          }
        }
        setSubmitted(false);
        stagingTab && setStagingTab(undefined);
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fieldStates, submitted, stagingTab]);
  };

  const onSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>): void => {
      debug && console.log("submit");
      event?.preventDefault();
      !submitted && setSubmitted(true);
    },
    [submitted]
  );

  const onTabChange = useCallback(
    (_tab: Tab): void => {
      debug && console.log("tab");
      debug && console.log(_tab);
      if (JSON.stringify(_tab) !== JSON.stringify(tab)) setStagingTab(_tab);
    },
    [tab]
  );

  const isValid = (): boolean => {
    debug && console.log("form is valid");
    const thing = !Object.values(fieldStates).some(
      (k) => (k as FieldStatus<FieldErrorType>).invalid && (k as FieldStatus<FieldErrorType>).updated
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
