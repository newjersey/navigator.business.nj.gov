/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextInfoElement } from "@/components/ContextInfoElement";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import analytics from "@/lib/utils/analytics";
import { ReactElement, useContext } from "react";

export const ContextualInfoPanel = (): ReactElement<any> => {
  const { contextualInfo, setContextualInfo } = useContext(ContextualInfoContext);

  const close = (): void => {
    analytics.event.contextual_sidebar_close_button.click.close_contextual_sidebar();
    setContextualInfo((prevContextualInfo: ContextualInfo) => {
      return {
        ...prevContextualInfo,
        isVisible: false,
      };
    });

    setTimeout(() => {
      setContextualInfo((prevContextualInfo: ContextualInfo) => {
        return {
          ...prevContextualInfo,
          markdown: "",
        };
      });
    }, 300);
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={close}
        data-testid="overlay"
        className={`info-overlay ${contextualInfo.isVisible ? "is-visible" : ""}`}
      />
      <FocusTrappedSidebar close={close} isOpen={contextualInfo.isVisible}>
        <ContextInfoElement
          isVisible={contextualInfo.isVisible}
          header={contextualInfo.header}
          markdown={contextualInfo.markdown}
          close={close}
        />
      </FocusTrappedSidebar>
    </>
  );
};
