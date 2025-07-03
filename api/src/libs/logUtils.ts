export const getDurationMs = (start: number): string => {
  return `${Date.now() - start}ms`;
};
