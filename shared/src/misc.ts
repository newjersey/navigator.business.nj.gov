export type NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export const createEmptyNameAndAddress = (): NameAndAddress => ({
  name: "",
  addressLine1: "",
  addressLine2: "",
  zipCode: "",
});
