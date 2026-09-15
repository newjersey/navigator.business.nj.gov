export const toProperCase = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  return value.replaceAll(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
};

export const validateEmail = (email: string): boolean => {
  return !!/^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/.test(
    String(email).toLowerCase(),
  );
};
