/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from "@/components/Content";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { Icon } from "@/components/njwds/Icon";
import analytics from "@/lib/utils/analytics";
import { ContextualInfo, ContextualInfoContext } from "@/pages/_app";
import React, { ReactElement, useContext } from "react";

// eslint-disable-next-line react/display-name
export const ContextInfoElement = React.forwardRef(
  (
    props: { isVisible: boolean; markdown: string; close?: () => void },
    ref?: React.LegacyRef<any>
  ): ReactElement => (
    <aside
      data-testid="info-panel"
      aria-label="Additional Information Panel"
      className={`info-panel ${props.isVisible ? "is-visible" : "is-hidden"}`}
      ref={ref}
    >
      <button
        className="fdr fac fjc info-panel-close cursor-pointer"
        aria-label="close panel"
        onClick={props.close}
      >
        <Icon className="font-sans-xl">close</Icon>
      </button>
      <Content>{props.markdown}</Content>
    </aside>
  )
);

export const ContextualInfoPanel = (): ReactElement => {
  const { contextualInfo, setContextualInfo } = useContext(ContextualInfoContext);

  const close = () => {
    analytics.event.contextual_sidebar_close_button.click.close_contextual_sidebar();
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
        onClick={close}
        data-testid="overlay"
        className={`info-overlay ${contextualInfo.isVisible ? "is-visible" : ""}`}
      />
      <FocusTrappedSidebar close={close} isOpen={contextualInfo.isVisible}>
        <ContextInfoElement
          isVisible={contextualInfo.isVisible}
          markdown={contextualInfo.markdown}
          close={close}
        />
      </FocusTrappedSidebar>
    </>
  );
};
