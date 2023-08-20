import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { generateBusinessNameAvailability } from "@businessnjgovnavigator/shared";
import { NameAvailability } from "@businessnjgovnavigator/shared/businessNameSearch";
import { act, fireEvent, screen } from "@testing-library/react";

const mockApi = api as jest.Mocked<typeof api>;
const Config = getMergedConfig();

export const getSearchValue = (): string => {
  return (inputField() as HTMLInputElement)?.value;
};

export const fillText = (value: string, dba?: { dba: boolean }): void => {
  fireEvent.change(dba?.dba ? dbaInputField() : inputField(), { target: { value: value } });
};

export const searchAndGetValue = async (
  nameAvailability: Partial<NameAvailability>,
  dba?: { dba: boolean },
): Promise<void> => {
  const returnedPromise = Promise.resolve(generateBusinessNameAvailability(nameAvailability));
  mockApi.searchBusinessName.mockReturnValue(returnedPromise);
  fireEvent.click(dba?.dba ? dbaSearchButton() : searchButton());
  await act(() => {
    return returnedPromise.then();
  });
};

export const mockSearchReturnValue = (nameAvailability: Partial<NameAvailability>): void => {
  const returnedPromise = Promise.resolve(generateBusinessNameAvailability(nameAvailability));
  mockApi.searchBusinessName.mockReturnValue(returnedPromise);
};

export const searchAndReject = async (dba?: { dba: boolean }): Promise<void> => {
  const returnedPromise = Promise.reject(400);
  mockApi.searchBusinessName.mockReturnValue(returnedPromise);
  fireEvent.click(dba?.dba ? dbaSearchButton() : searchButton());
  await act(() => {
    return returnedPromise.catch(() => {});
  });
};

export const searchAndFail = async (dba?: { dba: boolean }): Promise<void> => {
  const returnedPromise = Promise.reject(500);
  mockApi.searchBusinessName.mockReturnValue(returnedPromise);
  fireEvent.click(dba?.dba ? dbaSearchButton() : searchButton());
  await act(() => {
    return returnedPromise.catch(() => {});
  });
};

export const searchButton = (): HTMLElement => {
  return screen.getByText(Config.searchBusinessNameTask.searchButtonText);
};
export const dbaSearchButton = (): HTMLElement => {
  return screen.getByText(Config.nexusNameSearch.dbaNameSearchSubmitButton);
};
export const inputField = (): HTMLElement => {
  return screen.getByLabelText("Search business name");
};
export const dbaInputField = (): HTMLElement => {
  return screen.getByLabelText(Config.nexusNameSearch.dbaNameSearchLabel);
};
