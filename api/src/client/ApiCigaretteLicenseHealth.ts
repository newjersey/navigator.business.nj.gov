import { createEmptyUser } from "@shared/businessUser";
import { CigaretteLicenseData } from "@shared/cigaretteLicense";
import { getCurrentBusiness } from "@shared/index";
import { createEmptyUserData, UserData } from "@shared/userData";
import { getCurrentDateISOString } from "@shared/dateHelpers";

const cigLicenseData: CigaretteLicenseData = {
  businessName: "some-business-name",
  responsibleOwnerName: "some-owner-name",
  tradeName: "some-trade-name",
  taxId: "777777777771",
  encryptedTaxId: "encrypted-777777777771",
  addressLine1: "some-address-1",
  addressLine2: "some-address-2",
  addressCity: "some-city",
  addressState: { shortCode: "MD", name: "Maryland" },
  addressZipCode: "07111",
  mailingAddressIsTheSame: true,
  mailingAddressLine1: "some-address-1",
  mailingAddressLine2: "some-address-2",
  mailingAddressCity: "some-city",
  mailingAddressState: { shortCode: "MD", name: "Maryland" },
  mailingAddressZipCode: "07111",
  contactName: "some-contact-name",
  contactPhoneNumber: "some-phone-number",
  contactEmail: "some-email",
  salesInfoStartDate: "08/31/2025",
  salesInfoSupplier: [],
  signerName: "some-signer-name",
  signerRelationship: "some-signer-relationship",
  signature: true,
  lastUpdatedISO: getCurrentDateISOString(),
  paymentInfo: {
    token: "",
    orderId: undefined,
    orderStatus: "",
    orderTimestamp: "",
    confirmationEmailsent: false,
  },
};

const skeletonBusinessUser = {
  ...createEmptyUser(),
  email: "test@example.com",
};
const healthCheckUser = createEmptyUserData(skeletonBusinessUser);
const currentBusiness = getCurrentBusiness(healthCheckUser);
const currentBusinessId = currentBusiness.id;

const updatedBusiness = {
  ...currentBusiness,
  ...cigLicenseData,
};

healthCheckUser.businesses[currentBusinessId] = updatedBusiness;

export const ApiCigaretteLicenseHealth: UserData = healthCheckUser;
