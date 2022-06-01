import { toProperCase } from "@businessnjgovnavigator/shared/";

interface Props {
  dueDate?: string;
  status?: string;
}

export const OpportunityCardStatus = (props: Props) => {
  return (
    <>
      {props.dueDate && props.status !== "first come, first serve" && props.status !== "rolling application" && (
        <div className="dashboard-opportunity-card-due-date">
          <span className="dashboard-opportunity-card-due-date-header">Due: </span>
          {props.dueDate}{" "}
        </div>
      )}
      {(props.status === "first come, first serve" || props.status === "rolling application") && (
        <div className="dashboard-opportunity-card-due-date text-bold">{toProperCase(props.status)}</div>
      )}
    </>
  );
};
