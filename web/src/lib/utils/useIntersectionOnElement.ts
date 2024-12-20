import { RefObject, useEffect, useState } from "react";

export const useIntersectionOnElement = (
  element: RefObject<HTMLElement | null>,
  rootMargin: string
): boolean => {
  const [isVisible, setState] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(entry.isIntersecting);
      },
      { rootMargin }
    );

    element.current && observer.observe(element.current);

    const el = element.current;
    return (): void => {
      observer.unobserve(el as HTMLElement);
    };
  }, [element, rootMargin]);

  return isVisible;
};
