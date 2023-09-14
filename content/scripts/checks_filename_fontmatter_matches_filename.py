import os
import re
import yaml  # PyYAML library for parsing YAML frontmatter

def check_filename_mismatch(directory):
    for filename in os.listdir(directory):
        if filename.endswith(".md"):
            file_path = os.path.join(directory, filename)
            with open(file_path, "r") as file:
                try:
                    content = file.read()
                    frontmatter_match = re.match(r'^---\n(.*?\n)---\n', content, re.DOTALL)
                    if frontmatter_match:
                        frontmatter_text = frontmatter_match.group(1)
                        frontmatter = yaml.safe_load(frontmatter_text)
                        
                        if "filename" in frontmatter and frontmatter["filename"] != os.path.splitext(filename)[0]:
                            print(f"Filename mismatch in file: {filename}")
                            # print(f"    Expected filename: {os.path.splitext(filename)[0]}")
                            # print(f"    Frontmatter filename: {frontmatter['filename']}")
                    
                except Exception as e:
                    print(f"Error processing {filename}: {str(e)}")

# Specify the directory containing the Markdown files
md_directory = "../src/webflow-licenses"

check_filename_mismatch(md_directory)
