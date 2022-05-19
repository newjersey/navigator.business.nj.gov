import { ABStorageFactory } from "@/lib/storage/ABStorage";
import { createEmptyUserDisplayContent, UserContentType, UserDisplayContent } from "@/lib/types/types";
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
  displayContent: UserDisplayContent;
  flow?: UserContentType;
  municipalities: Municipality[];
}

interface ProfileDataContextType {
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
    displayContent: createEmptyUserDisplayContent(),
    municipalities: [],
  },
  setProfileData: () => {},
  setUser: () => {},
  onBack: () => {},
});
