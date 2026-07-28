import { RefObject, useEffect, useState } from "react";

export const useIntersectionOnElement = (
  element: RefObject<HTMLElement | null>,
  rootMargin: string,
): boolean => {
  const [isVisible, setState] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(entry.isIntersecting);
      },
      { rootMargin },
    );

    const observedElement = element.current;
    if (!observedElement) {
      return;
    }

    observer.observe(observedElement);
    return (): void => {
      observer.unobserve(observedElement);
    };
  }, [element, rootMargin]);

  return isVisible;
};
