import os
import json
import csv


def get_add_on_for_non_essential_question(question_id):
    file_path = "../content/src/roadmaps/nonEssentialQuestions.json"
    with open(file_path, "r", encoding="utf-8") as neq_file:
        neq_json = json.load(neq_file).get("nonEssentialQuestionsArray", [])
        for neq in neq_json:
            if neq["id"] == question_id:
                return neq["addOn"]
    raise Exception(
        f'Possible data mismatch. No addOn found for non-essential question "{question_id}".'
    )


def get_tasks_for_non_essential_question(question_id):
    add_on_id = get_add_on_for_non_essential_question(question_id)

    file_path = f"../content/src/roadmaps/add-ons/{add_on_id}.json"
    with open(file_path, "r", encoding="utf-8") as add_on_file:
        roadmap_steps = json.load(add_on_file).get("roadmapSteps")
        roadmap_task_ids = [
            step.get("task", step.get("licenseTask")) for step in roadmap_steps
        ]
        return roadmap_task_ids


def get_industry_non_essential_questions_and_tasks(directory_path, output_csv_file):
    """
    This function builds the basis of a report that outlines all non-essential questions,
    the corresponding industry or legal type, and the task pages that they are associated with.

    The function reads from the list of industry roadmaps and pulls the list of non-essential
    questions and the corresponding task pages. It leaves spaces for legal structure. Populating
    these values is a manual process.
    """
    with open(output_csv_file, "w", newline="", encoding="utf-8") as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(
            [
                "Industry Name",
                "Legal Structure",
                "nonEssentialQuestionsId",
                "Corresponding Task Pages",
            ]
        )

        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)

            with open(file_path, "r", encoding="utf-8") as f:
                try:
                    json_data = json.load(f)

                    name = json_data.get("name", "")
                    non_essential_ids = json_data.get("nonEssentialQuestionsIds", [])

                    if non_essential_ids:
                        for non_essential_id in non_essential_ids:
                            roadmap_task_ids = get_tasks_for_non_essential_question(
                                non_essential_id
                            )
                            for roadmap_task_id in roadmap_task_ids:
                                csv_writer.writerow(
                                    [name, "", non_essential_id, roadmap_task_id]
                                )
                    else:
                        csv_writer.writerow([name, "", "", ""])

                except json.JSONDecodeError as e:
                    print(f"Error decoding JSON from file {filename}: {e}")


directory_path = "../content/src/roadmaps/industries"
output_csv_file = "results.csv"

get_industry_non_essential_questions_and_tasks(directory_path, output_csv_file)
