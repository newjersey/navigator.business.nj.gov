import { ABStorageFactory } from "@/lib/storage/ABStorage";
import { FlowType } from "@/lib/types/types";
import {
  BusinessUser,
  createEmptyProfileData,
  createEmptyUser,
  Municipality,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { createContext } from "react";

interface ProfileDataState {
  page?: number;
  profileData: ProfileData;
  user?: BusinessUser;
  flow: FlowType;
  municipalities: Municipality[];
}

export interface ProfileDataContextType {
  state: ProfileDataState;
  setProfileData: (profileData: ProfileData) => void;
  setUser: (user: BusinessUser) => void;
  onBack: () => void;
}

export const ProfileDataContext = createContext<ProfileDataContextType>({
  state: {
    page: 1,
    profileData: createEmptyProfileData(),
    user: createEmptyUser(ABStorageFactory().getExperience()),
    flow: "STARTING",
    municipalities: [],
  },
  setProfileData: () => {},
  setUser: () => {},
  onBack: () => {},
});
