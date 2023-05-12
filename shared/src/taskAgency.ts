import TaskAgenciesJSON from "../../content/src/mappings/taskAgency.json";

export interface TaskAgency {
  readonly id: string;
  readonly name: string;
}

export const LookupTaskAgencyById = (id: string): TaskAgency => {
  return (
    arrayOfTaskAgencies.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: "",
    }
  );
};

export const arrayOfTaskAgencies: TaskAgency[] = TaskAgenciesJSON.arrayOfTaskAgencies;
