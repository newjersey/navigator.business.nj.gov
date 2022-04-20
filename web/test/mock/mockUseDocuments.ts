import * as useDocumentsModule from "@/lib/data-hooks/useDocuments";
import { generateProfileData } from "@/test/factories";
import { ProfileDocuments } from "@businessnjgovnavigator/shared/";

const mockUseDocuments = (useDocumentsModule as jest.Mocked<typeof useDocumentsModule>).useDocuments;

export const useMockDocuments = (overrides: Partial<ProfileDocuments>): void => {
  const profileData = generateProfileData({});
  setMockDocumentsResponse({ ...profileData.documents, ...overrides });
};

export const setMockDocumentsResponse = (documents: ProfileDocuments | undefined): void => {
  mockUseDocuments.mockReturnValue({ documents, checkData: () => Promise.resolve() });
};
