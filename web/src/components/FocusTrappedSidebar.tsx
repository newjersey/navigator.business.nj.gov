import { onEscape, useMountEffect } from "@/lib/utils/helpers";
import FocusTrap from "focus-trap-react";
import React, { ReactElement, useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
  close: () => void;
  isOpen: boolean;
  delayTime?: number;
  CMS_ONLY_disable_focus_trap?: boolean;
}

export const FocusTrappedSidebar = ({
  children,
  close,
  isOpen,
  delayTime = 300,
  CMS_ONLY_disable_focus_trap,
}: Props): ReactElement<any> => {
  const [showDiv, setShowDiv] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isOpen && !showDiv) {
      setShowDiv(true);
    } else if (!isOpen && showDiv) {
      timeoutId = setTimeout(() => {
        return setShowDiv(false);
      }, delayTime);
    }
    return (): void => {
      return clearTimeout(timeoutId);
    };
  }, [isOpen, delayTime, showDiv]);

  useMountEffect(() => {
    const handleKeydown = (event: KeyboardEvent): void => {
      onEscape(event, close);
    };
    window.addEventListener("keydown", handleKeydown);

    return (): void => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  if (CMS_ONLY_disable_focus_trap) return <>{children}</>;

  return showDiv ? (
    <FocusTrap focusTrapOptions={{ allowOutsideClick: true, tabbableOptions: { displayCheck: "none" } }}>
      {children}
    </FocusTrap>
  ) : (
    <></>
  );
};
