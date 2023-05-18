import { UpdateQueue } from "@/lib/types/types";
import {
  BusinessUser,
  Preferences,
  ProfileData,
  TaskProgress,
  TaxFilingData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { FormationData } from "@businessnjgovnavigator/shared/formationData";

export class UpdateQueueFactory implements UpdateQueue {
  private internalQueue: UserData;
  private updateFunction: (userData: UserData | undefined) => Promise<void>;

  constructor(userData: UserData, update: (userData: UserData | undefined) => Promise<void>) {
    this.internalQueue = userData;
    this.updateFunction = update;
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

  queueFormationData(formationData: Partial<FormationData>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      formationData: {
        ...this.internalQueue.formationData,
        ...formationData,
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

  queueTaskItemChecklist(taskItemChecklist: Record<string, boolean>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      taskItemChecklist: {
        ...this.internalQueue.taskItemChecklist,
        ...taskItemChecklist,
      },
    };
    return this;
  }

  update(): Promise<void> {
    return this.updateFunction(this.internalQueue);
  }

  current(): UserData {
    return this.internalQueue;
  }
}
