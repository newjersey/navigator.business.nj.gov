import { useEffect } from "react";

export const useMountEffect = (fun: () => void): void => useEffect(fun, []);
