export const allInlineIconTypes = ["green checkmark", "red x mark"] as const;
export type InlineIconType = (typeof allInlineIconTypes)[number];
