import {
  FieldErrorType,
  FormContextType,
  ReducedFieldStates,
} from "@businessnjgovnavigator/shared/types";
import { Context, createContext } from "react";

export const createReducedFieldStates = <
  K extends string | number | symbol,
  FieldError = FieldErrorType,
>(
  fields: K[],
): ReducedFieldStates<K, FieldError> => {
  return fields.reduce(
    (p, c: K) => {
      p[c] = { invalid: false };
      return p;
    },
    {} as ReducedFieldStates<K, FieldError>,
  );
};

export const createFormContext = <T>(): Context<FormContextType<T>> =>
  createContext<FormContextType<T>>({
    fieldStates: {} as ReducedFieldStates<keyof T>,
    runValidations: false,
    reducer: () => ({}) as ReducedFieldStates<keyof T>,
  });
