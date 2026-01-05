import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";

interface CSSTransitionProps {
  children: ReactNode;
  in: boolean;
  unmountOnExit?: boolean;
  timeout: number;
  classNames: string;
}

/**
 * React 19 compatible CSSTransition component
 * Replacement for react-transition-group's CSSTransition
 */
export const CSSTransition = (props: CSSTransitionProps): ReactElement | null => {
  const [shouldRender, setShouldRender] = useState(props.in);
  const [currentState, setCurrentState] = useState<"enter" | "exit" | "active" | null>(
    props.in ? "enter" : null,
  );
  const timeoutRef = useRef<NodeJS.Timeout>();
  const activeTimeoutRef = useRef<NodeJS.Timeout>();
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (activeTimeoutRef.current) {
      clearTimeout(activeTimeoutRef.current);
    }

    if (props.in) {
      // Entering
      timeoutRef.current = setTimeout(() => {
        setShouldRender(true);
        setCurrentState("enter");

        activeTimeoutRef.current = setTimeout(() => {
          setCurrentState("active");
        }, 50);
      }, 0);
    } else if (shouldRender) {
      // Exiting
      timeoutRef.current = setTimeout(() => {
        setCurrentState("exit");

        activeTimeoutRef.current = setTimeout(() => {
          setCurrentState(null);
          if (props.unmountOnExit) {
            setShouldRender(false);
          }
        }, props.timeout);
      }, 0);
    }

    isFirstMount.current = false;

    return (): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (activeTimeoutRef.current) {
        clearTimeout(activeTimeoutRef.current);
      }
    };
  }, [props.in, props.timeout, props.unmountOnExit, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  const getClassNames = (): string => {
    const baseClassNames = props.classNames.split(" ");
    const animationClass = baseClassNames[baseClassNames.length - 1];
    const otherClasses = baseClassNames.slice(0, -1).join(" ");

    switch (currentState) {
      case "enter":
        return `${otherClasses} ${animationClass}-enter`;
      case "active":
        return `${otherClasses} ${animationClass}-enter-active`;
      case "exit":
        return `${otherClasses} ${animationClass}-exit ${animationClass}-exit-active`;
      default:
        return props.classNames;
    }
  };

  return <div className={getClassNames()}>{props.children}</div>;
};
