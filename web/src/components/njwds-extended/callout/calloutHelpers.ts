export type CalloutTypes = "informational" | "conditional" | "warning" | "quickReference";

export interface CalloutStyling {
  backgroundColor: string;
  textColor: string;
  headerIcon: string;
}

export interface LargeCalloutProps extends IconProps {
  calloutType: CalloutTypes;
  showHeader?: string | boolean;
  headerText?: string;
}

export interface MiniCalloutProps {
  calloutType: CalloutTypes;
  headerText: string;
}

export const CALLOUT_STYLES: Record<CalloutTypes, CalloutStyling> = {
  informational: {
    backgroundColor: "bg-accent-cool-lightest",
    textColor: "text-accent-cool-more-dark",
    headerIcon: "callout-informational-icon",
  },
  conditional: {
    backgroundColor: "bg-primary-extra-light",
    textColor: "text-primary-darker",
    headerIcon: "callout-conditional-icon",
  },
  warning: {
    backgroundColor: "bg-warning-extra-light",
    textColor: "text-accent-warm-darker",
    headerIcon: "callout-warning-icon",
  },
  quickReference: {
    backgroundColor: "bg-base-lightest",
    textColor: "text-primary-darker",
    headerIcon: "callout-quickReference-icon",
  },
};

export type IconType = "phone" | "email" | "text";

export interface IconProps {
  amountIconText?: string;
  filingTypeIconText?: string;
  frequencyIconText?: string;
  phoneIconText?: string;
  emailIconText?: string;
}

export interface IconTextProps {
  iconName: string;
  text: string;
  type: IconType;
  label: string;
}

interface IconItem {
  propName: keyof IconProps;
  iconName: string;
  type: IconType;
  ariaLabelKey: string;
}

export const ICON_ITEMS: IconItem[] = [
  {
    propName: "amountIconText",
    iconName: "attach_money",
    type: "text",
    ariaLabelKey: "amountIconAriaLabel",
  },
  {
    propName: "filingTypeIconText",
    iconName: "file_present",
    type: "text",
    ariaLabelKey: "filingTypeIconAriaLabel",
  },
  {
    propName: "frequencyIconText",
    iconName: "autorenew",
    type: "text",
    ariaLabelKey: "frequencyIconAriaLabel",
  },
  {
    propName: "phoneIconText",
    iconName: "phone",
    type: "phone",
    ariaLabelKey: "phoneIconAriaLabel",
  },
  {
    propName: "emailIconText",
    iconName: "alternate_email",
    type: "email",
    ariaLabelKey: "emailIconAriaLabel",
  },
];

export const getIconItems = <T extends IconProps>(props: T): IconTextProps[] => {
  if (!props) return [];

  const iconItems: IconTextProps[] = [];

  for (const item of ICON_ITEMS) {
    const text = props[item.propName];
    if (text) {
      iconItems.push({
        iconName: item.iconName,
        text: text,
        type: item.type,
        label: item.ariaLabelKey,
      });
    }
  }

  return iconItems;
};
