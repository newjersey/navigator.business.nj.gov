import os
import re
import yaml

def find_missing_fields(directory):
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
                        
                        if "displayname" not in frontmatter or "filename" not in frontmatter:
                            print(f"Missing fields in file: {filename}")
                    
                except Exception as e:
                    print(f"Error processing {filename}: {str(e)}")

# Specify the directory containing the Markdown files
md_directory = "./src/webflow-licenses"

find_missing_fields(md_directory)
