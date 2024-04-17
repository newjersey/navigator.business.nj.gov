#!/usr/bin/env python

import os
import re


def add_displayname_to_md_files(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".md"):
            file_path = os.path.join(directory, filename)
            with open(file_path, "r+") as file:
                try:
                    content = file.read()
                    displayname = os.path.splitext(filename)[0]

                    # Check if frontmatter already exists
                    frontmatter_match = re.match(
                        r"^---\n(.*?\n)---\n", content, re.DOTALL
                    )
                    if frontmatter_match:
                        frontmatter = frontmatter_match.group(1)
                        updated_content = content.replace(
                            frontmatter, f"displayname: {displayname}\n{frontmatter}", 1
                        )
                    else:
                        updated_content = f"displayname: {displayname}\n---\n{content}"

                    file.seek(0)
                    file.write(updated_content)
                    file.truncate()
                    print(f"Added 'displayname' to {filename}")
                except Exception as e:
                    print(f"Error processing {filename}: {str(e)}")


# Specify the directory containing the Markdown files
md_directory = "../../web/src/lib/roadmap/fixtures/tasks"

add_displayname_to_md_files(md_directory)
