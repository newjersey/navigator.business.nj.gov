import { useRouter } from "next/router";

export const mockPush = jest.fn().mockResolvedValue({});

export const useMockRouter = (overrides: Partial<{ push: () => void; replace: () => void }>): void => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    replace: mockPush,
    ...overrides,
  });
};
