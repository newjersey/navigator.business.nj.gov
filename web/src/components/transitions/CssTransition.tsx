import type { ReactElement, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Props for the local CSS transition wrapper.
 */
export interface CssTransitionProps {
  /**
   * Content that stays mounted while the enter or exit transition is active.
   */
  readonly children: ReactNode;

  /**
   * Optional wrapper classes applied alongside transition classes.
   */
  readonly className?: string;

  /**
   * Whether the transition content should enter and remain visible.
   */
  readonly isVisible: boolean;

  /**
   * Exit duration in milliseconds before content is removed when unmounting is enabled.
   */
  readonly timeout: number;

  /**
   * Base class name used to build enter and exit transition classes.
   */
  readonly transitionClassName: string;

  /**
   * Whether content should be removed from the DOM after the exit transition completes.
   */
  readonly unmountOnExit?: boolean;
}

type TransitionPhase = "enter" | "enter-active" | "exit";

const joinClassNames = (classNames: readonly string[]): string => {
  return classNames.filter(Boolean).join(" ");
};

const getTransitionClassName = (props: CssTransitionProps, phase: TransitionPhase): string => {
  if (phase === "exit") {
    return joinClassNames([
      props.className ?? "",
      `${props.transitionClassName}-exit`,
      `${props.transitionClassName}-exit-active`,
    ]);
  }

  return joinClassNames([props.className ?? "", `${props.transitionClassName}-${phase}`]);
};

/**
 * Lightweight wrapper for CSS enter and exit transitions.
 */
export const CssTransition = (props: CssTransitionProps): ReactElement | null => {
  const [shouldRender, setShouldRender] = useState<boolean>(props.isVisible);
  const [phase, setPhase] = useState<TransitionPhase>("enter-active");
  const animationFrameRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasMountedRef = useRef<boolean>(false);

  useEffect(() => {
    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }

    if (props.isVisible) {
      setShouldRender(true);
      setPhase("enter");
      animationFrameRef.current = requestAnimationFrame(() => {
        setPhase("enter-active");
      });
    } else if (shouldRender) {
      setPhase("exit");
      timeoutRef.current = setTimeout(() => {
        if (props.unmountOnExit) {
          setShouldRender(false);
        }
      }, props.timeout);
    }

    return (): void => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [props.isVisible, props.timeout, props.unmountOnExit, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return <div className={getTransitionClassName(props, phase)}>{props.children}</div>;
};
