export const splitFullName = (name: string | undefined): SplitName => {
  if (!name) return { firstName: "", lastName: "" };
  const words = name.split(" ");
  return {
    firstName: words.shift() || "",
    lastName: words.join(" "),
  };
};

export type SplitName = {
  firstName: string;
  lastName: string;
};
