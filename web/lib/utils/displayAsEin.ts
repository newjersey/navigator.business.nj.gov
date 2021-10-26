export const displayAsEin = (value: string): string => {
  const numerals = value.split("");
  if (numerals.length > 2) {
    numerals.splice(2, 0, "-");
  }
  return numerals.join("");
};
