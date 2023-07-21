export const getBusinessIconColor = (index: number): string => {
  if (index % 4 === 0) return "green";
  else if (index % 4 === 1) return "blue";
  else if (index % 4 === 2) return "purple";
  else return "teal";
};
