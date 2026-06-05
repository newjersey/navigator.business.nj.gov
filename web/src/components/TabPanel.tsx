import { ReactElement, ReactNode } from "react";

interface TabPanelProps {
  readonly activeValue: number;
  readonly children: ReactNode;
  readonly idPrefix: string;
  readonly value: number;
}

export const getTabId = (idPrefix: string, value: number): string => {
  return `${idPrefix}-tab-${value}`;
};

export const getTabPanelId = (idPrefix: string, value: number): string => {
  return `${idPrefix}-tabpanel-${value}`;
};

export const TabPanel = (props: TabPanelProps): ReactElement => {
  return (
    <div
      aria-labelledby={getTabId(props.idPrefix, props.value)}
      hidden={props.activeValue !== props.value}
      id={getTabPanelId(props.idPrefix, props.value)}
      role="tabpanel"
    >
      {props.activeValue === props.value && props.children}
    </div>
  );
};
