export const PageSizes = {
  xs: 480, //mobile-lg + up (30em)
  sm: 640, //tablet + up (40em)
  md: 800, //(50em)
  lg: 1024, //desktop + up (64em)
};

export const MediaQueries = {
  desktopAndUp: `(min-width:${PageSizes.lg}px)`,
  tabletAndUp: `(min-width:${PageSizes.sm}px)`,
  isMobile: `(max-width:${PageSizes.sm}px)`,
};
