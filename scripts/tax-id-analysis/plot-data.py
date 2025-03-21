import json

with open("duplicates.json", "r") as file:
    data = json.load(file)


test_tax_ids = []

total_user_ids = set()
total_business_ids = set()
tax_id_entered_by_same_user = 0
tax_id_entered_by_different_user = 0

for record in data:
    for tax_id, users in record.items():
        if tax_id not in test_tax_ids:
            user_ids = []
            for user in users:
                user_id = user["userId"]
                total_user_ids.add(user_id)
                user_ids.append(user_id)
                business_id = user["businessId"]
                total_business_ids.add(business_id)
            if len(set(user_ids)) == 1:
                tax_id_entered_by_same_user += 1
            else:
                tax_id_entered_by_different_user += 1

number_of_users = len(total_user_ids)
number_of_businesses = len(total_business_ids)

print(f"Number of Users: {number_of_users}")
print(f"Number of Businesses: {number_of_businesses}")
print(
    f"Number of Duplicate Tax IDs entered by same user: {tax_id_entered_by_same_user}"
)
print(
    f"Number of Duplicate Tax IDs entered by different users: {tax_id_entered_by_different_user}"
)
