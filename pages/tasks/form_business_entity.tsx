import { PageSkeleton } from "../../components/PageSkeleton";
import React, { ReactElement } from "react";
import { TasksEntity } from "../../lib/types/Roadmap";
import Link from "next/link";
import { TaskLayout } from "../../components/TaskLayout";

const RoadmapPage = (): ReactElement => {
  const task: TasksEntity = {
    task_number: 3,
    id: "form_business_entity",
    name: "Form your Business Entity",
    description:
      "Form the legal structure that you will operate under, and register that structure and name with the state of New Jersey.",
    destination: {
      name: "",
      link: "https://www.njportal.com/DOR/BusinessFormation/CompanyInformation/BusinessName",
    },
    to_complete_must_have: [
      "Desired Name",
      "Legal Structure",
      "NAICS code",
      "EIN",
      "Registered Agent",
      "Payment Credit Card or E-Check",
    ],
    after_completing_will_have: ["Entity ID", "Certificate of Standing", "Certified Copy"],
  };

  return (
    <PageSkeleton>
      <TaskLayout>
        <h1>{task.name}</h1>
        <p>{task.description}</p>

        <p>To complete this step, you must have:</p>
        <ul>
          {task.to_complete_must_have.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>

        <p>After you complete this step, you will have:</p>
        <ul>
          {task.after_completing_will_have.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>

        <Link href={task.destination.link}>
          <button className="usa-button">Complete form</button>
        </Link>
      </TaskLayout>
    </PageSkeleton>
  );
};

export default RoadmapPage;
