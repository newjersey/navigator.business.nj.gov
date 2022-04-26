export type NameAndAddress = {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly zipCode: string;
};

export const createEmptyNameAndAddress = (): NameAndAddress => ({
  name: "",
  addressLine1: "",
  addressLine2: "",
  zipCode: "",
});
