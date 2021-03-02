import { UserData } from "./UserData";

export interface ApiClient {
  getUserData: () => Promise<UserData>;
}
