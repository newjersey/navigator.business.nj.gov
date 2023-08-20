/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import React, { forwardRef, ReactElement } from "react";

// eslint-disable-next-line react/display-name
export const ContextInfoElement = forwardRef(
  (
    props: { isVisible: boolean; header: string; markdown: string; close?: () => void },
    ref?: React.LegacyRef<any>,
  ): ReactElement => {
    return (
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
        <h3>{props.header}</h3>
        <Content>{props.markdown}</Content>
      </aside>
    );
  },
);
