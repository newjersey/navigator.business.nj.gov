#!/usr/bin/env python

import os
import yaml


def validate_markdown_ids(directory):
    mismatched_files = []

    # Iterate through all files in the directory
    for filename in os.listdir(directory):
        # Process only markdown files
        if filename.endswith(".md"):
            filepath = os.path.join(directory, filename)

            # Open and read the markdown file
            with open(filepath, "r", encoding="utf-8") as file:
                content = file.read()

            # Extract the metadata block
            if content.startswith("---"):
                metadata_end = content.find("---", 3)  # Find the closing '---'
                if metadata_end != -1:
                    metadata_block = content[3:metadata_end].strip()

                    # Parse the YAML metadata
                    try:
                        metadata = yaml.safe_load(metadata_block)

                        # Check if 'id' matches the filename (without extension)
                        expected_id = os.path.splitext(filename)[0]
                        if metadata.get("id") != expected_id:
                            mismatched_files.append(filename)

                    except yaml.YAMLError as e:
                        print(f"Error parsing YAML in file {filename}: {e}")

    return mismatched_files


# Specify the directory containing markdown files
directory = "../content/src/webflow-licenses"

# Validate the markdown files
mismatched_files = validate_markdown_ids(directory)

# Output the results
if mismatched_files:
    print("The following files have mismatched 'id' fields:")
    for file in mismatched_files:
        print(f"- {file}")
else:
    print("All files have matching 'id' fields.")
