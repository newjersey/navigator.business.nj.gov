import type React from "react";
import { forwardRef, type ReactElement } from "react";
import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import { Heading } from "@/components/njwds-extended/Heading";

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
          type="button"
          className="fdr fac fjc info-panel-close cursor-pointer"
          aria-label="close panel"
          onClick={props.close}
        >
          <Icon id="info-panel-close-button" className="font-sans-xl" iconName="close" />
        </button>
        <Heading level={2}>{props.header}</Heading>
        <Content>{props.markdown}</Content>
      </aside>
    );
  },
);
