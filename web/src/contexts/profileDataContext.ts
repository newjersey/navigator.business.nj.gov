import { ABStorageFactory } from "@/lib/storage/ABStorage";
import { FlowType } from "@/lib/types/types";
import {
  BusinessUser,
  createEmptyProfileData,
  createEmptyUser,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { createContext } from "react";

interface ProfileDataState {
  page?: number;
  profileData: ProfileData;
  user?: BusinessUser;
  flow: FlowType;
}

interface ProfileDataContextType {
  state: ProfileDataState;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  setUser: (user: BusinessUser) => void;
  onBack: () => void;
}

export const ProfileDataContext = createContext<ProfileDataContextType>({
  state: {
    page: 1,
    profileData: createEmptyProfileData(),
    user: createEmptyUser(ABStorageFactory().getExperience()),
    flow: "STARTING",
  },
  setProfileData: () => {},
  setUser: () => {},
  onBack: () => {},
});
