// eslint-disable-next-line no-undef
module.exports = (path, options) => {
  return options.defaultResolver(path, {
    ...options,
    packageFilter: (pkg) => {
      if (pkg.name === "uuid") {
        delete pkg["exports"];
        delete pkg["module"];
      }
      return pkg;
    }
  });
};
