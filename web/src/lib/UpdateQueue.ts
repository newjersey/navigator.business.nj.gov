import { UpdateQueue } from "@/lib/types/types";
import {
  Business,
  BusinessUser,
  Preferences,
  ProfileData,
  TaskProgress,
  TaxFilingData,
  UserData
} from "@businessnjgovnavigator/shared";
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
    const updatedBusiness: Business = {...this.internalQueue.businesses[this.internalQueue.currentBusinessID], profileData: {...this.internalQueue.businesses[this.internalQueue.currentBusinessID].profileData, ...profileData}}
    const updatedBusinesses: Record<string, Business> = {...this.internalQueue.businesses, [this.internalQueue.currentBusinessID]: updatedBusiness}
    this.internalQueue = {
      ...this.internalQueue,
     businesses: updatedBusinesses
    };
    return this;
  }

  queueFormationData(formationData: Partial<FormationData>): UpdateQueue {
    const updatedBusiness: Business = {...this.internalQueue.businesses[this.internalQueue.currentBusinessID], formationData: {...this.internalQueue.businesses[this.internalQueue.currentBusinessID].formationData, ...formationData}}
    const updatedBusinesses: Record<string, Business> = {...this.internalQueue.businesses, [this.internalQueue.currentBusinessID]: updatedBusiness}
    this.internalQueue = {
      ...this.internalQueue,
      businesses: updatedBusinesses
    };
    return this;
  }

  queueFormationFormData(formationFormData: Partial<FormationFormData>): UpdateQueue {
    const updatedBusiness: Business = {...this.internalQueue.businesses[this.internalQueue.currentBusinessID], formationData: {...this.internalQueue.businesses[this.internalQueue.currentBusinessID].formationData, formationFormData: {
          ...this.internalQueue.businesses[this.internalQueue.currentBusinessID].formationData.formationFormData, ...formationFormData
        }}}
    const updatedBusinesses: Record<string, Business> = {...this.internalQueue.businesses, [this.internalQueue.currentBusinessID]: updatedBusiness}
    this.internalQueue = {
      ...this.internalQueue,
      businesses: updatedBusinesses
    };
    return this;
  }

  queueTaskProgress(taskProgress: Record<string, TaskProgress>): UpdateQueue {
    const updatedBusiness: Business = {...this.internalQueue.businesses[this.internalQueue.currentBusinessID], taskProgress: {...this.internalQueue.businesses[this.internalQueue.currentBusinessID].taskProgress, ...taskProgress}}
    const updatedBusinesses: Record<string, Business> = {...this.internalQueue.businesses, [this.internalQueue.currentBusinessID]: updatedBusiness}
    this.internalQueue = {
      ...this.internalQueue,
      businesses: updatedBusinesses
    };
    return this;
  }

  queuePreferences(preferences: Partial<Preferences>): UpdateQueue {
    const updatedBusiness: Business = {...this.internalQueue.businesses[this.internalQueue.currentBusinessID], preferences: {...this.internalQueue.businesses[this.internalQueue.currentBusinessID].preferences, ...preferences}}
    const updatedBusinesses: Record<string, Business> = {...this.internalQueue.businesses, [this.internalQueue.currentBusinessID]: updatedBusiness}
    this.internalQueue = {
      ...this.internalQueue,
      businesses: updatedBusinesses
    };
    return this;
  }

  queueTaxFilingData(taxFilingData: Partial<TaxFilingData>): UpdateQueue {
    const updatedBusiness: Business = {...this.internalQueue.businesses[this.internalQueue.currentBusinessID], taxFilingData: {...this.internalQueue.businesses[this.internalQueue.currentBusinessID].taxFilingData, ...taxFilingData}}
    const updatedBusinesses: Record<string, Business> = {...this.internalQueue.businesses, [this.internalQueue.currentBusinessID]: updatedBusiness}
    this.internalQueue = {
      ...this.internalQueue,
      businesses: updatedBusinesses
    };
    return this;
  }

  queueTaskItemChecklist(taskItemChecklist: Record<string, boolean>): UpdateQueue {
    const updatedBusiness: Business = {...this.internalQueue.businesses[this.internalQueue.currentBusinessID], taskItemChecklist: {...this.internalQueue.businesses[this.internalQueue.currentBusinessID].taskItemChecklist, ...taskItemChecklist}}
    const updatedBusinesses: Record<string, Business> = {...this.internalQueue.businesses, [this.internalQueue.currentBusinessID]: updatedBusiness}
    this.internalQueue = {
      ...this.internalQueue,
      businesses: updatedBusinesses
    };
    return this;
  }

  update(config?: { local?: boolean }): Promise<void> {
    return this.updateFunction(this.internalQueue, config);
  }

  current(): UserData {
    return this.internalQueue;
  }
}
