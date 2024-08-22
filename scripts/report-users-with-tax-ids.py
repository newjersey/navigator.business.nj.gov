import os
import json
import csv

# Define the directory containing source files and the output CSV filename
input_directory = ""
output_csv = ""


def extract_info(user_data):
    if "email" in user_data:
        email = user_data["email"]["S"]
    else:
        email = user_data["data"]["M"]["user"]["M"]["email"]["S"]
    extracted_data = []

    # Any business post-Ethan
    if "businesses" in user_data["data"]["M"]:
        businesses = user_data["data"]["M"]["businesses"]["M"]
        for _, business_data in businesses.items():
            business_name = business_data["M"]["profileData"]["M"]["businessName"]["S"]
            encrypted_tax_id_exists = (
                "encryptedTaxId" in business_data["M"]["profileData"]["M"]
            )

            extracted_data.append((email, business_name, encrypted_tax_id_exists))
    # Pre-Ethan
    elif "profileData" in user_data["data"]["M"]:
        tax_id_exits = False
        if "taxId" in user_data["data"]["M"]["profileData"]["M"]:
            tax_id_exits = (
                len(user_data["data"]["M"]["profileData"]["M"]["taxId"]["S"]) > 0
            )
        business_name = user_data["data"]["M"]["profileData"]["M"]["businessName"]["S"]
        extracted_data.append((email, business_name, tax_id_exits))
    # Pre-business profile
    else:
        tax_id_exits = False
        if "taxId" in user_data["data"]["M"]["onboardingData"]["M"]:
            tax_id_exits = (
                len(user_data["data"]["M"]["onboardingData"]["M"]["taxId"]["S"]) > 0
            )
        business_name = user_data["data"]["M"]["onboardingData"]["M"]["businessName"][
            "S"
        ]
        extracted_data.append((email, business_name, tax_id_exits))
    return extracted_data


with open(output_csv, "w", newline="") as csvfile:
    csv_writer = csv.writer(csvfile)
    csv_writer.writerow(["Email", "Business Name", "Has Tax ID"])

    for filename in os.listdir(input_directory):
        file_path = os.path.join(input_directory, filename)
        with open(file_path, "r") as jsonfile:
            json_data = json.load(jsonfile)
            items = json_data["Items"]

            for item in items:
                extracted_data = extract_info(item)
                for row in extracted_data:
                    csv_writer.writerow(row)

print(f"Data has been successfully written to {output_csv}")
