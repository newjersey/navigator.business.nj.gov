#!/usr/bin/env python
"""This script finds contextual links in markdown files."""

import os
import re
import sys
from pathlib import Path
from typing import List, Tuple


def find_markdown_files(root_folder: str) -> List[str]:
    """Finds all markdown files (.md) recursively starting from a root folder.

    Args:
        root_folder (str): The directory to start the search.

    Returns:
        list of strings: A list of paths to markdown files found in the directory and its subdirectories.
    """
    markdown_files = []
    for subdir, _, files in os.walk(root_folder):
        for file in files:
            if file.endswith(".md"):
                path = Path(os.path.join(subdir, file))
                relative_path = path.relative_to(root_folder)
                markdown_files.append(relative_path)
    return markdown_files


def parse_markdown_file(file_path: str) -> List[Tuple[str]]:
    """Parses a given markdown file and finds inline code blocks.

    Args:
        file_path (str): The path to the markdown file.

    Returns:
        list of tuples: A list of found inline code blocks as strings. Each block is represented as a tuple,
            where the first element is the block before '|' and the second one is the block after '|'.
    """
    inline_code_pattern = re.compile(r"`([^`]*\|[^`]*)`")

    with open(file_path, "r", encoding="utf-8") as file:
        content = file.read()

    return inline_code_pattern.findall(content)


def main(root_folder: str):
    """The main function of the script. It finds markdown files and parses them for inline code blocks,
       printing out the result in a CSV format.

    Args:
        root_folder (str): The directory to start the search for markdown files.
    """
    markdown_files = find_markdown_files(root_folder)

    for markdown_file in markdown_files:
        inline_code_blocks = parse_markdown_file(
            os.path.join(root_folder, markdown_file)
        )

        if inline_code_blocks:
            for block in inline_code_blocks:
                block_clean = block.replace("\n", "  ")

                # Checking whether the '|' character is present in the block
                part_after_pipe = (
                    block_clean.split("|", 1)[1].strip() if "|" in block_clean else ""
                )

                print(f'"{markdown_file}","{part_after_pipe}"')


if __name__ == "__main__":
    print('"markdown file path","contextual link destination"')
    main(Path(__file__).parent.parent / "src")
