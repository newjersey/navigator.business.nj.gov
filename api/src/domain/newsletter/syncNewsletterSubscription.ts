import { NewsletterResponse } from "@shared/businessUser";
import { UserData } from "@shared/userData";

export type GovDeliveryCommCloudClientType = {
  subscribe: (email: string) => Promise<NewsletterResponse>;
  unsubscribe: (email: string) => Promise<NewsletterResponse>;
  updateEmail: (oldEmail: string, newEmail: string) => Promise<NewsletterResponse>;
};

const setUserFields = (
  userData: UserData,
  fields: Partial<{
    newsletterEmail: string | undefined;
    newsletterSuccess: boolean | undefined;
    clearNewsletter: boolean;
  }>,
): UserData => {
  const externalStatus =
    fields.clearNewsletter === true
      ? { ...userData.user.externalStatus, newsletter: undefined }
      : fields.newsletterSuccess === undefined
        ? userData.user.externalStatus
        : {
            ...userData.user.externalStatus,
            newsletter: { success: fields.newsletterSuccess, status: "SUCCESS" as const },
          };

  return {
    ...userData,
    user: {
      ...userData.user,
      newsletterEmail:
        "newsletterEmail" in fields ? fields.newsletterEmail : userData.user.newsletterEmail,
      externalStatus,
    },
  };
};

export const syncNewsletterSubscription = async (
  oldUserData: UserData,
  newUserData: UserData,
  client: GovDeliveryCommCloudClientType,
): Promise<UserData> => {
  const email = newUserData.user.email;
  const receiveNewsletter = newUserData.user.receiveNewsletter;

  // Determine the email address GovDelivery has on file, supporting users
  // subscribed before newsletterEmail existed (backward compat)
  const effectiveNewsletterEmail =
    newUserData.user.newsletterEmail ??
    (oldUserData.user.externalStatus.newsletter?.success ? oldUserData.user.email : undefined);

  // Case A: wants newsletter, not currently subscribed anywhere
  if (receiveNewsletter && !effectiveNewsletterEmail) {
    const response = await client.subscribe(email);
    return response.success
      ? setUserFields(newUserData, { newsletterEmail: email, newsletterSuccess: true })
      : setUserFields(newUserData, { newsletterEmail: undefined, newsletterSuccess: false });
  }

  // Case B: wants newsletter, already subscribed with same email
  if (receiveNewsletter && effectiveNewsletterEmail === email) {
    return newUserData;
  }

  // Case C: wants newsletter, subscribed with different email (email change)
  if (receiveNewsletter && effectiveNewsletterEmail && effectiveNewsletterEmail !== email) {
    const response = await client.updateEmail(effectiveNewsletterEmail, email);
    return response.success
      ? setUserFields(newUserData, { newsletterEmail: email })
      : setUserFields(newUserData, { newsletterEmail: effectiveNewsletterEmail });
  }

  // Case D: doesn't want newsletter, but is still subscribed
  if (!receiveNewsletter && effectiveNewsletterEmail) {
    const response = await client.unsubscribe(effectiveNewsletterEmail);
    return response.success
      ? setUserFields(newUserData, { newsletterEmail: undefined, clearNewsletter: true })
      : setUserFields(newUserData, { newsletterEmail: effectiveNewsletterEmail });
  }

  // Case E: doesn't want newsletter, not subscribed — no-op
  return newUserData;
};
