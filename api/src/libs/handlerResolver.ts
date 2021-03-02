export const handlerPath = (context: string): string => {
  return `${context.split(process.cwd())[1].substring(1).replace(/\\/g, "/")}`;
};
