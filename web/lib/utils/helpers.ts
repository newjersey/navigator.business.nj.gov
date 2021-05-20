import { useEffect, useState } from "react";

export const useMountEffect = (fun: () => void): void => useEffect(fun, []);

export const useOnWindowResize = (fun: () => void): void =>
  useEffect(() => {
    window.addEventListener("resize", fun);
    return function cleanup() {
      window.removeEventListener("resize", fun);
    };
  });

export const useMountEffectWhenDefined = (fun: () => void, thingToBeDefined: unknown | undefined): void => {
  const [effectOccurred, setEffectOccurred] = useState<boolean>(false);
  useEffect(() => {
    if (thingToBeDefined && !effectOccurred) {
      setEffectOccurred(true);
      fun();
    }
  }, [thingToBeDefined]);
};

export const onEscape = (e: KeyboardEvent, handler: () => void): void => {
  if (e.key === "Escape") {
    e.preventDefault();
    handler();
  }
};

export const templateEval = (template: string, args: Record<string, string>): string =>
  template.replace(/\${(\w+)}/g, (_, v) => args[v]);
