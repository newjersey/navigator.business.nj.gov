import * as useDocumentsModule from "@/lib/data-hooks/useDocuments";
import { generateProfileData, ProfileDocuments } from "@businessnjgovnavigator/shared/";

const mockUseDocuments = (useDocumentsModule as vi.Mocked<typeof useDocumentsModule>).useDocuments;

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
