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
  oldUserData: UserData,
  newUserData: UserData,
  client: GovDeliveryCommCloudClientType,
): Promise<SyncResult> => {
  const oldReceiveNewsletter = oldUserData.user.receiveNewsletter;
  const oldEmail = oldUserData.user.email;
  const newReceiveNewsletter = newUserData.user.receiveNewsletter;
  const newEmail = newUserData.user.email;

  // Case A: subscribing
  if (newReceiveNewsletter && !oldReceiveNewsletter) {
    const response = await client.subscribe(newEmail);
    return response.success
      ? { ok: true, userData: newUserData }
      : { ok: false, errorType: "SUBSCRIBE_FAILED" };
  }

  // Case B: already subscribed, same email — no-op
  if (newReceiveNewsletter && oldReceiveNewsletter && newEmail === oldEmail) {
    return { ok: true, userData: newUserData };
  }

  // Case C: subscribed and email changed
  if (newReceiveNewsletter && oldReceiveNewsletter && newEmail !== oldEmail) {
    const response = await client.updateEmail(oldEmail, newEmail);
    return response.success
      ? { ok: true, userData: newUserData }
      : { ok: false, errorType: "EMAIL_UPDATE_FAILED" };
  }

  // Case D: unsubscribing
  if (!newReceiveNewsletter && oldReceiveNewsletter) {
    const response = await client.unsubscribe(oldEmail);
    return response.success
      ? { ok: true, userData: newUserData }
      : { ok: false, errorType: "UNSUBSCRIBE_FAILED" };
  }

  // Case E: already unsubscribed — no-op
  return { ok: true, userData: newUserData };
};
