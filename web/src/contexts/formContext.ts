import { FieldErrorType, ReducedFieldStates } from "@/lib/types/types";
import { Context, createContext, Reducer } from "react";

export enum FieldStateActionKind {
  RESET = "RESET",
  REGISTER = "REGISTER",
  UNREGISTER = "UNREGISTER",
  VALIDATION = "VALIDATION",
}

interface ValidationAction<T, FieldError = FieldErrorType> {
  type: FieldStateActionKind.VALIDATION;
  payload: { field: keyof T | (keyof T)[]; invalid: boolean; errorTypes?: FieldError[] };
}

interface RegisterAction<T> {
  type: FieldStateActionKind.REGISTER;
  payload: { field: keyof T };
}

interface UnRegisterAction<T> {
  type: FieldStateActionKind.UNREGISTER;
  payload: { field: keyof T };
}

interface ResetAction {
  type: FieldStateActionKind.RESET;
  payload?: undefined;
}

export type FormContextReducerActions<T, FieldError = FieldErrorType> =
  | ResetAction
  | ValidationAction<T, FieldError>
  | RegisterAction<T>
  | UnRegisterAction<T>;

export type FormContextReducer<T, FieldError = FieldErrorType> = Reducer<
  ReducedFieldStates<keyof T, FieldError>,
  FormContextReducerActions<T, FieldError>
>;

export interface FormContextType<T, FieldError = FieldErrorType> {
  fieldStates: ReducedFieldStates<keyof T, FieldError>;
  runValidations: boolean;
  reducer: React.Dispatch<FormContextReducerActions<ReducedFieldStates<keyof T, FieldError>, FieldError>>;
}

export const createFormContext = <T>(): Context<FormContextType<T>> =>
  createContext<FormContextType<T>>({
    fieldStates: {} as ReducedFieldStates<keyof T>,
    runValidations: false,
    reducer: () => ({} as ReducedFieldStates<keyof T>),
  });
