import React, { ReactElement, useContext, useEffect } from "react";
import { Icon } from "./njwds/Icon";
import { ContextualInfoContext } from "../pages/_app";
import { Content } from "./Content";

export const ContextualInfoPanel = (): ReactElement => {
  const { contextualInfoMd, setContextualInfoMd } = useContext(ContextualInfoContext);
  const closeButton = React.createRef<HTMLButtonElement>();
  const panel = React.createRef<HTMLDivElement>();

  useEffect(() => {
    setFocus();
    if (panel.current) {
      panel.current.addEventListener("transitionend", () => {
        setFocus();
      });
    }
  }, [contextualInfoMd]);

  const setFocus = () => {
    if (contextualInfoMd && closeButton.current) {
      closeButton.current.focus();
    }
  };

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
      <aside ref={panel} data-testid="info-panel" className={`info-panel ${isVisible()}`}>
        <button ref={closeButton} className="fdr fac fjc info-panel-close" onClick={close}>
          <Icon className="font-sans-xl">close</Icon>
        </button>
        <Content>{contextualInfoMd}</Content>
      </aside>
    </>
  );
};
