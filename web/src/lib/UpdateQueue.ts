import { UpdateQueue } from "@/lib/types/types";
import {
  BusinessUser,
  Preferences,
  ProfileData,
  TaskProgress,
  TaxFilingData,
  UserData,
} from "@businessnjgovnavigator/shared";

export class UpdateQueueFactory implements UpdateQueue {
  private internalQueue: UserData;
  private updateFuntion: (userData: UserData | undefined) => Promise<void>;

  constructor(userData: UserData, update: (userData: UserData | undefined) => Promise<void>) {
    this.internalQueue = userData;
    this.updateFuntion = update;
  }

  queue(userData: Partial<UserData>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      ...userData,
    };
    return this;
  }

  queueUser(user: Partial<BusinessUser>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      user: {
        ...this.internalQueue.user,
        ...user,
      },
    };
    return this;
  }

  queueProfileData(profileData: Partial<ProfileData>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      profileData: {
        ...this.internalQueue.profileData,
        ...profileData,
      },
    };
    return this;
  }

  queueTaskProgress(taskProgress: Record<string, TaskProgress>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      taskProgress: {
        ...this.internalQueue.taskProgress,
        ...taskProgress,
      },
    };
    return this;
  }

  queuePreferences(preferences: Partial<Preferences>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      preferences: {
        ...this.internalQueue.preferences,
        ...preferences,
      },
    };
    return this;
  }

  queueTaxFilingData(taxFilingData: Partial<TaxFilingData>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      taxFilingData: {
        ...this.internalQueue.taxFilingData,
        ...taxFilingData,
      },
    };
    return this;
  }

  update(): Promise<void> {
    return this.updateFuntion(this.internalQueue);
  }

  current(): UserData {
    return this.internalQueue;
  }
}
