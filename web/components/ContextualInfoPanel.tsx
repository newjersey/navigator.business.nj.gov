import React, { ReactElement, useContext } from "react";
import { Icon } from "@/components/njwds/Icon";
import { ContextualInfo, ContextualInfoContext } from "@/pages/_app";
import { Content } from "@/components/Content";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import analytics from "@/lib/utils/analytics";

export const ContextualInfoPanel = (): ReactElement => {
  const { contextualInfo, setContextualInfo } = useContext(ContextualInfoContext);

  const close = () => {
    setContextualInfo((prevContextualInfo: ContextualInfo) => ({
      ...prevContextualInfo,
      isVisible: false,
    }));

    setTimeout(() => {
      setContextualInfo((prevContextualInfo: ContextualInfo) => ({
        ...prevContextualInfo,
        markdown: "",
      }));
    }, 300);
  };

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => {
          analytics.event.contextual_sidebar.click_outside.close_contextual_sidebar();
          close();
        }}
        data-testid="overlay"
        className={`info-overlay ${contextualInfo.isVisible ? "is-visible" : ""}`}
      />
      <FocusTrappedSidebar close={close} isOpen={contextualInfo.isVisible}>
        <aside
          data-testid="info-panel"
          aria-label="Additional Information Panel"
          className={`info-panel ${contextualInfo.isVisible ? "is-visible" : "is-hidden"}`}
        >
          <button
            className="fdr fac fjc info-panel-close cursor-pointer"
            aria-label="close panel"
            onClick={() => {
              analytics.event.contextual_sidebar_close_button.click.close_contextual_sidebar();
              close();
            }}
          >
            <Icon className="font-sans-xl">close</Icon>
          </button>
          <Content>{contextualInfo.markdown}</Content>
        </aside>
      </FocusTrappedSidebar>
    </>
  );
};
