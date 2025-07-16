import os
import csv

folder_path = "../src/display-content/contextual-information"
output_file = "contextual-information.csv"

rows = []

for filename in os.listdir(folder_path):
    if filename.endswith(".md") or filename.endswith(".txt") or filename.endswith(".yml"):
        with open(os.path.join(folder_path, filename), "r", encoding="utf-8") as file:
            lines = file.readlines()

            id_val = ""
            header_val = ""

            for line in lines:
                if line.strip().startswith("id:"):
                    id_val = line.strip().split("id:")[1].strip()
                elif line.strip().startswith("header:"):
                    header_val = line.strip().split("header:")[1].strip()

                if id_val and header_val:
                    break

            if id_val and header_val:
                rows.append((id_val, header_val))

# Write to CSV
with open(output_file, mode="w", newline="", encoding="utf-8") as csv_file:
    writer = csv.writer(csv_file)
    writer.writerow(["id", "header"])
    writer.writerows(rows)

print(f"✅ Extracted {len(rows)} entries into {output_file}")
