import { NewsletterResponse } from "@shared/businessUser";
import { UserData } from "@shared/userData";

export type GovDeliveryCommCloudClientType = {
  subscribe: (email: string) => Promise<NewsletterResponse>;
  unsubscribe: (email: string) => Promise<NewsletterResponse>;
  updateEmail: (oldEmail: string, newEmail: string) => Promise<NewsletterResponse>;
};

export type SyncResult =
  | { ok: true; userData: UserData }
  | { ok: false; errorType: "SUBSCRIBE_FAILED" | "UNSUBSCRIBE_FAILED" | "EMAIL_UPDATE_FAILED" };

export const syncNewsletterSubscription = async (
  oldUserData: UserData | undefined,
  newUserData: UserData,
  client: GovDeliveryCommCloudClientType,
): Promise<SyncResult> => {
  const oldReceiveNewsletter = oldUserData?.user.receiveNewsletter ?? false;
  const newReceiveNewsletter = newUserData.user.receiveNewsletter;
  const oldEmail = oldUserData?.user.email ?? "";
  const newEmail = newUserData.user.email;

  const isSubscribing = newReceiveNewsletter && !oldReceiveNewsletter;
  const isSubscribed = newReceiveNewsletter && oldReceiveNewsletter;
  const isUnsubscribing = !newReceiveNewsletter && oldReceiveNewsletter;

  if (isSubscribing) {
    const response = await client.subscribe(newEmail);
    return response.success
      ? { ok: true, userData: newUserData }
      : { ok: false, errorType: "SUBSCRIBE_FAILED" };
  }

  if (isSubscribed && newEmail !== oldEmail) {
    const response = await client.updateEmail(oldEmail, newEmail);
    return response.success
      ? { ok: true, userData: newUserData }
      : { ok: false, errorType: "EMAIL_UPDATE_FAILED" };
  }

  if (isUnsubscribing) {
    const response = await client.unsubscribe(oldEmail);
    return response.success
      ? { ok: true, userData: newUserData }
      : { ok: false, errorType: "UNSUBSCRIBE_FAILED" };
  }

  return { ok: true, userData: newUserData };
};
