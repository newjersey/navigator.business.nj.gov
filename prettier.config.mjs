/** @type {import("prettier").Config} */
const config = {
  printWidth: 110,
  endOfLine: "auto",
  overrides: [
    {
      files: ["*.yml", "*.yaml"],
      options: {
        singleQuote: false,
      },
    },
  ],
};

export default config;
