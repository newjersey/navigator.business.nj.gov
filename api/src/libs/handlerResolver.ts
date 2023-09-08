export const handlerPath = (context: string): string => {
  return `${context.split(process.cwd())[1].slice(1).replaceAll("\\", "/")}`;
};
