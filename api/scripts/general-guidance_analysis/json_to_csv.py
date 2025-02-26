import json
import csv

# Define the path to the JSON file
json_file_path = "results.json"

# Load JSON data from the file
with open(json_file_path, "r", encoding="utf-8") as json_file:
    json_data = json.load(json_file)

# Flatten the JSON data for CSV output
flattened_data = []
for person in json_data["data"]:
    for biz in person["bizData"]:
        print(biz)
        flattened_entry = {
            "email": person["email"],
            "userTesting": person["userTesting"],
            "userId": biz["userId"],
            "industryId": biz["industryId"],
            "naicsCode": biz["naicsCode"],
            "wasteSubmitted": biz["wasteSubmitted"],
            "wasteApplicable": biz["wasteApplicable"],
            "landSubmitted": biz["landSubmitted"],
            "landApplicable": biz["landApplicable"],
            "airSubmited": biz["airSubmited"],
            "airApplicable": biz["airApplicable"],
        }
        flattened_data.append(flattened_entry)

# Define the CSV file path and header
csv_file_path = "output.csv"
csv_header = [
    "email",
    "userTesting",
    "userId",
    "industryId",
    "naicsCode",
    "wasteSubmitted",
    "wasteApplicable",
    "landSubmitted",
    "landApplicable",
    "airSubmited",
    "airApplicable",
]

# Write the flattened data to CSV
with open(csv_file_path, mode="w", newline="", encoding="utf-8") as csv_file:
    writer = csv.DictWriter(csv_file, fieldnames=csv_header)
    writer.writeheader()
    writer.writerows(flattened_data)

print("CSV file written successfully")
