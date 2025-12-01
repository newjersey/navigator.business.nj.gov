export const useMockIntersectionObserver = (): void => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => jest.fn(),
    unobserve: () => jest.fn(),
    disconnect: () => jest.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver;
};
