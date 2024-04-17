#!/usr/bin/env python

import os
import json


def add_displayname_to_json_files(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            file_path = os.path.join(directory, filename)
            with open(file_path, "r+") as file:
                try:
                    file_content = file.read()
                    data = json.loads(file_content)
                    displayname = os.path.splitext(filename)[0]
                    data = {"displayname": displayname, **data}  # Add displayname field
                    updated_content = json.dumps(
                        data, indent=2
                    )  # Use 2 space for indentation
                    file.seek(0)
                    file.write(updated_content)
                    file.truncate()
                    print(f"Added 'displayname' to {filename}")
                except json.JSONDecodeError:
                    print(f"Error decoding JSON in {filename}")


# Specify the directory containing the JSON files
json_directory = "../../web/src/lib/roadmap/fixtures/industries"

add_displayname_to_json_files(json_directory)
