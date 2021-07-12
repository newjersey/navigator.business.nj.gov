import { useRouter } from "next/router";

export const mockPush = jest.fn().mockResolvedValue({});

export const useMockRouter = (
  overrides: Partial<{ push: (args: never) => void; replace: (args: never) => void }>
): void => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    replace: mockPush,
    ...overrides,
  });
};
