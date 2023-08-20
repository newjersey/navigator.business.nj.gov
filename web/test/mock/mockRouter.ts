import { Router, useRouter } from "next/router";

export const mockPush = jest.fn().mockResolvedValue({});
export const mockQuery = jest.fn().mockResolvedValue({});

export const useMockRouter = (overrides: Partial<Router>): void => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    back: mockPush,
    replace: mockPush,
    query: mockQuery,
    ...overrides,
  });
};
