export default {
  process: (content) => {
    return {
      code: `module.exports = ${JSON.stringify(content)}`,
    };
  },
};
