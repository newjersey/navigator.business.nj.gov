export const formatDolEin = (ein: string): string => {
  const length = ein.length;
  if (length < 2) {
    return ein;
  }
  if (length < 5) {
    return `${ein.slice(0, 1)}-${ein.slice(1)}`;
  }
  if (length < 8) {
    return `${ein.slice(0, 1)}-${ein.slice(1, 4)}-${ein.slice(4)}`;
  }
  if (length < 11) {
    return `${ein.slice(0, 1)}-${ein.slice(1, 4)}-${ein.slice(4, 7)}-${ein.slice(7)}`;
  }
  if (length < 14) {
    return `${ein.slice(0, 1)}-${ein.slice(1, 4)}-${ein.slice(4, 7)}-${ein.slice(7, 10)}/${ein.slice(10)}`;
  }
  return `${ein.slice(0, 1)}-${ein.slice(1, 4)}-${ein.slice(4, 7)}-${ein.slice(7, 10)}/${ein.slice(10, 13)}-${ein.slice(13)}`;
};
