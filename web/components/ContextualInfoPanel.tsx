import React, { ReactElement, useContext } from "react";
import { Icon } from "@/components/njwds/Icon";
import { ContextualInfoContext } from "@/pages/_app";
import { Content } from "@/components/Content";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import analytics from "@/lib/utils/analytics";

export const ContextualInfoPanel = (): ReactElement => {
  const { contextualInfoMd, setContextualInfoMd } = useContext(ContextualInfoContext);

  const close = () => {
    setContextualInfoMd("");
  };

  const isVisible = () => (contextualInfoMd ? "is-visible" : "");

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => {
          analytics.event.contextual_sidebar.click_outside.close_contextual_sidebar();
          close();
        }}
        data-testid="overlay"
        className={`info-overlay ${isVisible()}`}
      />
      <FocusTrappedSidebar close={close} isOpen={!!isVisible()}>
        <aside data-testid="info-panel" className={`info-panel ${isVisible()}`}>
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
          <Content>{contextualInfoMd}</Content>
        </aside>
      </FocusTrappedSidebar>
    </>
  );
};
