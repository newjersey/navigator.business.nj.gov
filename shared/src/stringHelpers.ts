export const toProperCase = (value: string | undefined): string | undefined => {
  if (!value) return undefined;

  return value.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};
