import type { CSSProperties, ReactElement } from "react";

interface Props {
  label: string;
  percentage?: number;
  "data-testid"?: string;
}

export const ProgressBar = ({
  label,
  percentage = 0,
  "data-testid": testId,
}: Props): ReactElement => {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percentage}
      aria-valuemax={100}
      className="progress-bar"
      data-testid={testId}
      style={{ "--progress": `${percentage}%` } as CSSProperties}
    />
  );
};
