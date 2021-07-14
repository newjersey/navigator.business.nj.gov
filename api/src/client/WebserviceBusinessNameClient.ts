import { BusinessNameClient } from "../domain/types";
import axios, { AxiosError } from "axios";

export const WebserviceBusinessNameClient = (baseUrl: string): BusinessNameClient => {
  const search = (name: string): Promise<string[]> => {
    const url = `${baseUrl}/ws/simple/queryBusinessName`;
    console.log("requesting", url);
    return axios
      .post(url, {
        businessName: name,
      })
      .then((response) => {
        console.log("got response", response);
        return response.data || [];
      })
      .catch((error: AxiosError) => {
        console.log("got error", error);
        return Promise.reject(error.response?.status);
      });
  };

  return {
    search,
  };
};
