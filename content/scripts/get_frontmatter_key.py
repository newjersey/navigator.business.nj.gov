#!/usr/bin/env python

import yaml
import re
import os
from typing import Any, Optional


def extract_yaml_front_matter(markdown_content: str) -> Optional[str]:
    """
    Extracts the YAML front matter from a Markdown file.

    The function uses a regular expression to identify the YAML front matter,
    which is expected to be delimited by lines consisting of three hyphens (---).

    Args:
        markdown_content (str): A string containing the content of the Markdown file.

    Returns:
        Optional[str]: The extracted YAML front matter as a string, or None if no
        front matter is found.
    """
    pattern = re.compile(r"^---\s*$(.*?)^---\s*$", re.DOTALL | re.MULTILINE)

    # Search for the YAML front matter in the content
    match = pattern.search(markdown_content)

    if match:
        return match.group(1)  # Return the YAML content without the delimiters
    else:
        return None


def get_value_from_yaml_key(yaml_content: str, key: str) -> Optional[Any]:
    """
    Parses a string containing YAML content and retrieves the value of a specific key.

    Args:
        yaml_content (str): A string containing the YAML content.
        key (str): The key whose value needs to be retrieved.

    Returns:
        Optional[Any]: The value associated with the specified key, or None if the key
        is not found or if an error occurs during YAML parsing.
    """
    try:
        # Parse the YAML content
        yaml_data = yaml.safe_load(yaml_content)
    except yaml.YAMLError as e:
        print(f"Error parsing YAML content: {e}")
        return None

    # Retrieve the value for the specified key
    return yaml_data.get(key)


def get_yaml_value_from_markdown_file(file_path: str, key: str) -> Optional[Any]:
    """
    Reads a Markdown file, extracts the YAML front matter, and retrieves the value of a specific key.

    Args:
        file_path (str): The path to the Markdown file.
        key (str): The key whose value needs to be retrieved from the YAML front matter.

    Returns:
        Optional[Any]: The value associated with the specified key, or None if the file
        cannot be read, if no YAML front matter is found, or if the key is not present.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            content = file.read()

            # Extract the YAML front matter
            yaml_content = extract_yaml_front_matter(content)

            if yaml_content:
                # Retrieve the value of the specified key
                return get_value_from_yaml_key(yaml_content, key)
            else:
                print("No YAML front matter found.")
                return None
    except FileNotFoundError:
        print(f"File {file_path} not found.")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def print_names_from_markdown_filenames(filenames: [str]) -> None:
    """
    Given a list of filenames that exist under the content/src directory, print the value
    of the "name" attribute in the YAML front matter.

    Args:
        filenames ([str]): The paths to the Markdown files, excluding content/src.
    """
    for filename in filenames:
        if filename.endswith(".md"):
            file_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)), "../src", filename
            )

            # Change this to the key you want to retrieve
            key_to_retrieve = "name"
            value = get_yaml_value_from_markdown_file(file_path, key_to_retrieve)

            if value is not None:
                print(f"The value of '{key_to_retrieve}' in {filename} is: {value}")


if __name__ == "__main__":
    print_names_from_markdown_filenames(
        [
            # The list of filenames should be children of content/src, like the following:
            "certifications/lgbtq-1.md"
        ]
    )
