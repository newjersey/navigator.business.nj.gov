import os
import json


def find_unused_task_files(root: str, directories: list[str]) -> None:
    task_names = get_all_tasks_in_roadmaps(root, directories)
    filenames = get_all_task_markdown_filenames(root)

    task_names_not_in_filenames = find_task_names_not_in_filenames(
        task_names, filenames
    )
    print(
        f"Markdown files not in any roadmap: \n{list_to_output_str(task_names_not_in_filenames)}"
    )
    return


def find_task_names_not_in_filenames(
    tasks_in_roadmap: set[str], filenames: list[str]
) -> list[str]:
    for task in tasks_in_roadmap:
        try:
            filenames.remove(task)
        except ValueError:
            print(f"No matching markdown file for task: {task}")
    return filenames


def list_to_output_str(filenames: list[str]) -> str:
    output = ""
    for filename in filenames:
        output += f"{filename}\n"
    return output


def get_all_tasks_in_roadmaps(root: str, directories: list[str]) -> set[str]:
    tasks: set[str] = set()
    for directory in directories:
        dir_path = os.path.join(root, directory)
        filenames = os.listdir(dir_path)
        for filename in filenames:
            full_path = os.path.join(dir_path, filename)
            tasks = tasks.union(get_task_names_from_roadmap_file(full_path))
    if "" in tasks:
        tasks.remove("")
    return tasks


def get_task_names_from_roadmap_file(file_path: str) -> set[str]:
    with open(file_path) as file:
        roadmap_config = json.load(file)

        task_names: set[str] = set()

        if "roadmapSteps" in roadmap_config:
            roadmap_steps = roadmap_config["roadmapSteps"]

            task_names.update(
              # reminder that curly braces are the syntax for set literals in Python when no keys are included
                {step["task"] for step in roadmap_steps if "task" in step},
                {
                    step["licenseTask"]
                    for step in roadmap_steps
                    if "licenseTask" in step
                },
            )

        if "modifications" in roadmap_config:
            modifications = roadmap_config["modifications"]
            task_names.update(
                {modification["replaceWithFilename"] for modification in modifications}
            )

        return task_names


def get_all_task_markdown_filenames(root: str) -> list[str]:
    filenames: list[str] = []
    for _, _, files in os.walk(root):
        filenames.extend(file[:-3] for file in files if file.endswith(".md"))
    return filenames


if __name__ == "__main__":
    find_unused_task_files(root="../src/roadmaps", directories=["add-ons", "industries"])
