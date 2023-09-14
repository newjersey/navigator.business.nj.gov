import os
import re

def process_md_files(directory):
    for filename in os.listdir(directory):
        if filename.endswith('.md'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r') as file:
                content = file.read()
            
            # Use regular expression to find and count 'filename:' occurrences
            filename_matches = re.findall(r'filename:', content)
            if len(filename_matches) > 1:
                # Split the content by '---' to separate front matter
                front_matter = content.replace('---', "")
                
                # Split the front matter into lines
                front_matter_lines = front_matter.strip().split('\n')
                
                # Find the second occurrence of 'filename:' and remove it
                for i, line in enumerate(front_matter_lines):
                    if 'filename:' in line:
                        front_matter_lines.pop(i)
                        break

                reconstructed_lines = ""

                for line in front_matter_lines:
                    reconstructed_lines = reconstructed_lines + line + "\n"
                
                # Reconstruct the content with the modified front matter
                
                updated_content = '---\n' + reconstructed_lines + '---\n'
                
                # Write the updated content back to the file
                with open(filepath, 'w') as file:
                    file.write(updated_content)

if __name__ == "__main__":
    directory = "../src/webflow-licenses"  # Replace with the path to your directory
    process_md_files(directory)