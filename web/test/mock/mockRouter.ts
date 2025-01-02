import { useRouter } from "next/compat/router";
import { Router } from "next/router";

export const mockPush = vi.fn().mockResolvedValue({});
export const mockQuery = vi.fn().mockResolvedValue({});

export const useMockRouter = (overrides: Partial<Router>): void => {
  (useRouter as vi.Mock).mockReturnValue({
    push: mockPush,
    back: mockPush,
    replace: mockPush,
    query: mockQuery,
    pathname: "",
    ...overrides,
  });
};
