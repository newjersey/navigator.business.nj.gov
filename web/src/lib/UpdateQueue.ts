import { UpdateQueue } from "@/lib/types/types";
import {
  Business,
  BusinessUser,
  Preferences,
  ProfileData,
  TaskProgress,
  TaxFilingData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { EnvironmentData } from "@businessnjgovnavigator/shared/environment";
import { FormationData, FormationFormData } from "@businessnjgovnavigator/shared/formationData";

export class UpdateQueueFactory implements UpdateQueue {
  private internalQueue: UserData;
  private updateFunction: (userData: UserData | undefined, config?: { local?: boolean }) => Promise<void>;

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

  queueSwitchBusiness(id: string): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      currentBusinessId: id,
    };
    return this;
  }

  queueBusiness(business: Partial<Business>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      businesses: {
        ...this.internalQueue.businesses,
        [this.internalQueue.currentBusinessId]: {
          ...this.currentBusiness(),
          ...business,
        },
      },
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
      businesses: {
        ...this.internalQueue.businesses,
        [this.internalQueue.currentBusinessId]: {
          ...this.currentBusiness(),
          profileData: {
            ...this.currentBusiness().profileData,
            ...profileData,
          },
        },
      },
    };
    return this;
  }

  queueFormationData(formationData: Partial<FormationData>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      businesses: {
        ...this.internalQueue.businesses,
        [this.internalQueue.currentBusinessId]: {
          ...this.currentBusiness(),
          formationData: {
            ...this.currentBusiness().formationData,
            ...formationData,
          },
        },
      },
    };
    return this;
  }

  queueFormationFormData(formationFormData: Partial<FormationFormData>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      businesses: {
        ...this.internalQueue.businesses,
        [this.internalQueue.currentBusinessId]: {
          ...this.currentBusiness(),
          formationData: {
            ...this.currentBusiness().formationData,
            formationFormData: {
              ...this.currentBusiness().formationData.formationFormData,
              ...formationFormData,
            },
          },
        },
      },
    };
    return this;
  }

  queueTaskProgress(taskProgress: Record<string, TaskProgress>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      businesses: {
        ...this.internalQueue.businesses,
        [this.internalQueue.currentBusinessId]: {
          ...this.currentBusiness(),
          taskProgress: {
            ...this.currentBusiness().taskProgress,
            ...taskProgress,
          },
        },
      },
    };
    return this;
  }

  queuePreferences(preferences: Partial<Preferences>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      businesses: {
        ...this.internalQueue.businesses,
        [this.internalQueue.currentBusinessId]: {
          ...this.currentBusiness(),
          preferences: {
            ...this.currentBusiness().preferences,
            ...preferences,
          },
        },
      },
    };
    return this;
  }

  queueTaxFilingData(taxFilingData: Partial<TaxFilingData>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      businesses: {
        ...this.internalQueue.businesses,
        [this.internalQueue.currentBusinessId]: {
          ...this.currentBusiness(),
          taxFilingData: {
            ...this.currentBusiness().taxFilingData,
            ...taxFilingData,
          },
        },
      },
    };

    return this;
  }

  queueEnvironmentData(environmentData: Partial<EnvironmentData>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      businesses: {
        ...this.internalQueue.businesses,
        [this.internalQueue.currentBusinessId]: {
          ...this.currentBusiness(),
          environmentData: {
            ...this.currentBusiness().environmentData,
            ...environmentData,
          },
        },
      },
    };

    return this;
  }

  queueTaskItemChecklist(taskItemChecklist: Record<string, boolean>): UpdateQueue {
    this.internalQueue = {
      ...this.internalQueue,
      businesses: {
        ...this.internalQueue.businesses,
        [this.internalQueue.currentBusinessId]: {
          ...this.currentBusiness(),
          taskItemChecklist: {
            ...this.currentBusiness().taskItemChecklist,
            ...taskItemChecklist,
          },
        },
      },
    };
    return this;
  }

  update(config?: { local?: boolean }): Promise<void> {
    return this.updateFunction(this.internalQueue, config);
  }

  current(): UserData {
    return this.internalQueue;
  }

  currentBusiness(): Business {
    return this.internalQueue.businesses[this.internalQueue.currentBusinessId];
  }
}
