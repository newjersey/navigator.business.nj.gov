import { generateProfileData, type ProfileDocuments } from "@businessnjgovnavigator/shared/";
import * as useDocumentsModule from "@/lib/data-hooks/useDocuments";

const mockUseDocuments = (useDocumentsModule as jest.Mocked<typeof useDocumentsModule>)
  .useDocuments;

export const useMockDocuments = (overrides: Partial<ProfileDocuments>): void => {
  const profileData = generateProfileData({});
  setMockDocumentsResponse({ ...profileData.documents, ...overrides });
};

export const setMockDocumentsResponse = (documents: ProfileDocuments | undefined): void => {
  mockUseDocuments.mockReturnValue({
    documents,
    checkData: () => {
      return Promise.resolve();
    },
  });
};
