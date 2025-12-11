import { useRouter } from "next/compat/router";
import { Router } from "next/router";

type RouterEventHandler = (...args: unknown[]) => void;

const createMockRouterEvents = (): {
  on: (event: string, handler: RouterEventHandler) => void;
  off: (event: string, handler: RouterEventHandler) => void;
  emit: (event: string, ...args: unknown[]) => void;
  reset: () => void;
} => {
  const handlers: Record<string, Set<RouterEventHandler>> = {};

  const on = (event: string, handler: RouterEventHandler): void => {
    handlers[event] = handlers[event] ?? new Set();
    handlers[event].add(handler);
  };

  const off = (event: string, handler: RouterEventHandler): void => {
    handlers[event]?.delete(handler);
  };

  const emit = (event: string, ...args: unknown[]): void => {
    const eventHandlers = handlers[event];
    if (!eventHandlers) return;
    for (const handler of eventHandlers) {
      handler(...args);
    }
  };

  const reset = (): void => {
    for (const event of Object.keys(handlers)) {
      handlers[event].clear();
    }
  };

  return { on, off, emit, reset };
};

export const mockPush = jest.fn().mockResolvedValue({});
export const mockQuery = jest.fn().mockResolvedValue({});
export const mockRouterEvents = createMockRouterEvents();

export const useMockRouter = (overrides: Partial<Router>): void => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    back: mockPush,
    replace: mockPush,
    query: mockQuery,
    pathname: "",
    events: mockRouterEvents,
    ...overrides,
  });
};
