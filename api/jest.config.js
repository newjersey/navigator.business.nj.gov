module.exports = {
  ...require("ts-jest/jest-preset"),
  ...require("@shelf/jest-dynamodb/jest-preset"),
  testEnvironment: "node",
};
