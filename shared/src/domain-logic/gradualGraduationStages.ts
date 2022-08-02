export const formationTaskId = "form-business-entity";

export const isFormationTask = (id: string): boolean => {
  return id === formationTaskId;
};

export const taxTaskId = "register-for-taxes";

export const isTaxTask = (id: string): boolean => {
  return id === taxTaskId;
};
