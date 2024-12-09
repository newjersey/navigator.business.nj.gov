import json
import os
from collections import defaultdict


def find_duplicate_tax_ids(directory):
    tax_id_map = defaultdict(list)

    # Iterate over all files in the specified directory
    count = 0
    for filename in os.listdir(directory):
        if filename.endswith(".json"):
            print(f"Reading {filename}")
            filepath = os.path.join(directory, filename)
            with open(filepath, "r") as file:
                try:
                    # import pdb

                    # pdb.set_trace()
                    data = json.load(file)
                    users = data["Items"]
                    for user in users:
                        count += 1
                        user_id = user.get("userId", None)

                        print(f"\tProcessing user #{count}, userId: {user_id}")

                        businesses = user.get("data", {}).get("businesses", {})

                        # Iterate over each business and extract the encrypted tax ID
                        for business_id, business_data in businesses.items():
                            encrypted_tax_id = business_data.get("profileData", {}).get(
                                "encryptedTaxId", None
                            )
                            if encrypted_tax_id:
                                tax_id_map[encrypted_tax_id].append(
                                    (user_id, business_id)
                                )
                except json.JSONDecodeError:
                    print(f"Error decoding JSON from file: {filename}")

    # Check for duplicates and print them
    for encrypted_tax_id, entries in tax_id_map.items():
        if len(entries) > 1:
            print("\n")
            print(f"Duplicate encryptedTaxId found: {encrypted_tax_id}")
            for user_id, business_id in entries:
                print(f"  UserId: {user_id}, BusinessId: {business_id}")


# Specify the directory containing the JSON files
json_directory = "/Users/jhechter/Desktop/converted_data"
find_duplicate_tax_ids(json_directory)
