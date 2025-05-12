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
