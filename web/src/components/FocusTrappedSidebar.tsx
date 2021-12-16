import { onEscape, useMountEffect } from "@/lib/utils/helpers";
import FocusTrap from "focus-trap-react";
import React, { ReactElement, useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
  close: () => void;
  isOpen: boolean;
  delayTime?: number;
}

export const FocusTrappedSidebar = ({ children, close, isOpen, delayTime = 300 }: Props): ReactElement => {
  const [showDiv, setShowDiv] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isOpen && !showDiv) {
      setShowDiv(true);
    } else if (!isOpen && showDiv) {
      timeoutId = setTimeout(() => setShowDiv(false), delayTime);
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen, delayTime, showDiv]);

  useMountEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      onEscape(event, close);
    };
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  return showDiv ? <FocusTrap focusTrapOptions={{ allowOutsideClick: true }}>{children}</FocusTrap> : <></>;
};
