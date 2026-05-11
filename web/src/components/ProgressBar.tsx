import type { CSSProperties, ReactElement } from "react";

export function ProgressBar({
  percentage = 0,
  "data-testid": testId,
}: {
  percentage?: number;
  "data-testid"?: string;
}): ReactElement {
  return (
    <div
      className="progress-bar"
      data-testid={testId}
      style={{ "--progress": `${percentage}%` } as CSSProperties}
    />
  );
}
