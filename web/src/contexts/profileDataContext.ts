import { FlowType } from "@/lib/types/types";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared";
import { createContext } from "react";

interface ProfileDataState {
  page?: number;
  profileData: ProfileData;
  flow: FlowType;
}

interface ProfileDataContextType {
  state: ProfileDataState;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  onBack: () => void;
}

export const ProfileDataContext = createContext<ProfileDataContextType>({
  state: {
    page: 1,
    profileData: createEmptyProfileData(),
    flow: "STARTING",
  },
  setProfileData: () => {},
  onBack: () => {},
});
