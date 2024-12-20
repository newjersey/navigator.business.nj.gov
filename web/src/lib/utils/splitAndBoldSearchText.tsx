import { ReactElement } from "react";

export const splitAndBoldSearchText = (displayText: string, searchText: string): ReactElement<any> => {
  const index = displayText.toLowerCase().indexOf(searchText.toLowerCase());
  if (index >= 0) {
    const prefixText = displayText.slice(0, Math.max(0, index));
    const toBold = displayText.slice(index, index + searchText.length);
    const afterText = displayText.slice(index + searchText.length);
    return (
      <span style={{ whiteSpace: "pre-wrap" }}>
        {prefixText}
        <span className="text-bold" data-testid="span-bold">
          {toBold}
        </span>
        {afterText}
      </span>
    );
  } else {
    return <>{displayText}</>;
  }
};
