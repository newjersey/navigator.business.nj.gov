import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { NameAvailability } from "@/lib/types/types";
import { generateNameAvailability } from "@/test/factories";
import { act, fireEvent, screen } from "@testing-library/react";

const mockApi = api as jest.Mocked<typeof api>;
const Config = getMergedConfig();

export const getSearchValue = (): string => (inputField() as HTMLInputElement)?.value;

export const fillText = (value: string, dba?: { dba: boolean }) => {
  fireEvent.change(dba?.dba ? dbaInputField() : inputField(), { target: { value: value } });
};

export const searchAndGetValue = async (
  nameAvailability: Partial<NameAvailability>,
  dba?: { dba: boolean }
): Promise<void> => {
  const returnedPromise = Promise.resolve(generateNameAvailability(nameAvailability));
  mockApi.searchBusinessName.mockReturnValue(returnedPromise);
  fireEvent.click(dba?.dba ? dbaSearchButton() : searchButton());
  await act(() => returnedPromise.then());
};

export const mockSearchReturnValue = (nameAvailability: Partial<NameAvailability>): void => {
  const returnedPromise = Promise.resolve(generateNameAvailability(nameAvailability));
  mockApi.searchBusinessName.mockReturnValue(returnedPromise);
};

export const searchAndReject = async (dba?: { dba: boolean }): Promise<void> => {
  const returnedPromise = Promise.reject(400);
  mockApi.searchBusinessName.mockReturnValue(returnedPromise);
  fireEvent.click(dba?.dba ? dbaSearchButton() : searchButton());
  await act(() => returnedPromise.catch(() => {}));
};

export const searchAndFail = async (dba?: { dba: boolean }): Promise<void> => {
  const returnedPromise = Promise.reject(500);
  mockApi.searchBusinessName.mockReturnValue(returnedPromise);
  fireEvent.click(dba?.dba ? dbaSearchButton() : searchButton());
  await act(() => returnedPromise.catch(() => {}));
};

export const searchButton = () => screen.getByText(Config.searchBusinessNameTask.searchButtonText);
export const dbaSearchButton = () => screen.getByText(Config.nexusNameSearch.dbaNameSearchSubmitButton);
export const inputField = () => screen.getByPlaceholderText(Config.searchBusinessNameTask.placeholderText);
export const dbaInputField = () =>
  screen.getByPlaceholderText(Config.nexusNameSearch.dbaNameSearchPlaceholder);
