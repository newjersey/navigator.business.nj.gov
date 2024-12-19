import { DataField, DataFieldProps } from "@/components/data-fields/DataField";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface NumericFieldProps {
  maxLength: number;
  minLength?: number;
}

interface Props<T> extends Omit<DataFieldProps<T>, "numericProps">, NumericFieldProps {}

export const NumericField = <T,>({ minLength, maxLength, ...props }: Props<T>): ReactElement<any> => {
  const { Config } = useConfig();

  const validationText =
    minLength === undefined
      ? templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, {
          length: maxLength.toString(),
        })
      : templateEval(Config.onboardingDefaults.errorTextMinimumRangeNumericField, {
          min: minLength.toString(),
          max: maxLength.toString(),
        });
  return (
    <DataField
      numericProps={{ minLength, maxLength }}
      {...props}
      validationText={props.validationText ?? validationText}
    />
  );
};
