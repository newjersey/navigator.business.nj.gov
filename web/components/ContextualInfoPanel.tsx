import React, { ReactElement, useContext } from "react";
import { Icon } from "./njwds/Icon";
import { ContextualInfoContext } from "../pages/_app";
import { Content } from "./Content";
import { FocusTrappedSidebar } from "./FocusTrappedSidebar";

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
        onClick={close}
        data-testid="overlay"
        className={`info-overlay ${isVisible()}`}
      />
      <FocusTrappedSidebar close={close} isOpen={!!isVisible()}>
        <aside data-testid="info-panel" className={`info-panel ${isVisible()}`}>
          <button className="fdr fac fjc info-panel-close cursor-pointer" onClick={close}>
            <Icon className="font-sans-xl">close</Icon>
          </button>
          <Content>{contextualInfoMd}</Content>
        </aside>
      </FocusTrappedSidebar>
    </>
  );
};
