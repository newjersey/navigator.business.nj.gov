import React, { useEffect } from "react";

export const useMountEffect = (fun: () => void): void => useEffect(fun, []);

export const onKeyPress = (
  e: React.KeyboardEvent,
  onClick: (e: React.SyntheticEvent) => void
): void => {
  const enterOrSpace =
    e.key === "Enter" || e.key === " " || e.key === "Spacebar";
  if (enterOrSpace) {
    e.preventDefault();
    onClick(e);
  }
};
