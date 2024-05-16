#!/usr/bin/env python

import os
import re
from re import Match
from typing import Callable

DEBUG = False


def replace_with_custom_component(match: Callable[[Match[str]], str]) -> str:
    """Replace text content containing blockquote with custom element syntax.

    Args:
        match (Callable[[Match[str]], str]): The matched content containing blockquotes

    Returns:
        str: The content with the blockquotes replaced with the custom element syntax
    """

    # Split block content into lines and remove '>' from the beginning of each line
    block_lines = match.group(0).split("\n")
    block_lines = [line[1:].strip() for line in block_lines if line.startswith(">")]

    # Check if the first line is bold
    header = ""
    if block_lines and (
        (block_lines[0].startswith("**") and block_lines[0].endswith("**"))
    ):
        # Extract the header text without the bold syntax
        header = block_lines[0][2:-2].strip()

    if block_lines and block_lines[0].startswith("###"):
        # Extract the header text without the markdown heading
        header = block_lines[0][4:0].strip()
        # Remove the first line from the block content
        block_lines = block_lines[1:].strip()

    # Join the block content back into a single string
    block_content = "\n".join(block_lines).strip()

    # Wrap the content with the custom component syntax
    return f':::callout{{ showHeader="true" headerText="{header}" showIcon="false" calloutType="conditional" }}\n{block_content}\n:::\n'


def convert_blockquotes_to_custom(content: str) -> str:
    """Convert old content that may contain blockquotes (formerly "Green Boxes") to content that
    uses the conditional callout syntax.

    Args:
        content (str): Content from the Markdown file

    Returns:
        str: Converted content, or the same content if no blockquotes were found
    """

    # Define a regex pattern that matches blockquote syntax
    blockquote_pattern = re.compile(r"^>.*(?:\n^>.*)*", re.MULTILINE)

    # Replace all blockquote occurrences with the custom element
    return blockquote_pattern.sub(replace_with_custom_component, content)


def process_markdown_files(directory: str):
    """Process Markdown files in a directory for the replacement of the blockquotes for the custom
    component syntax.

    Args:
        directory (str): Directory potentially containing Markdown files
    """

    if not os.path.exists(directory):
        print(f"Error: The directory {directory} does not exist.")
        return

    if not os.path.isdir(directory):
        print(f"Error: The path {directory} is not a directory.")
        return

    if DEBUG is True:
        print(f"Searching for Markdown files in {directory}...")

    # Walk through the directory
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(".md"):
                file_path = os.path.join(root, file)

                if DEBUG is True:
                    print(f"Found Markdown file: {file_path}")

                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                updated_content = convert_blockquotes_to_custom(content)

                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(updated_content)

                print(f"Processed: {file_path}")
            else:
                if DEBUG is True:
                    print(f"Skipping non-Markdown file: {os.path.join(root, file)}")


def main():
    script_dir = os.path.abspath(os.path.dirname(__file__))
    directory = os.path.join(script_dir, "..", "src")
    process_markdown_files(directory)


if __name__ == "__main__":
    main()
