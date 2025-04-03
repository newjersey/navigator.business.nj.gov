import csv
from datetime import datetime
from collections import defaultdict

def filter_and_limit_rows_by_month(input_file, output_file, date_column_index, start_date, end_date, max_entries_per_month):
    # Dictionary to hold entries grouped by month
    month_entries = defaultdict(list)

    # Open the input CSV file for reading
    with open(input_file, mode='r', newline='') as csvfile:
        reader = csv.reader(csvfile)

        # Iterate over each row in the input file
        for row in reader:
            # Check if all values in the row are non-empty
            if all(field.strip() for field in row):
                try:
                    # Parse the date from the specified column
                    date = datetime.strptime(row[date_column_index], '%Y-%m-%d')
                    # Check if the date is within the specified range
                    if start_date <= date <= end_date:
                        # Group rows by year and month
                        month_key = (date.year, date.month)
                        month_entries[month_key].append(row)
                except ValueError:
                    # Handle cases where date parsing fails
                    pass

    # Open the output CSV file for writing
    with open(output_file, mode='w', newline='') as outfile:
        writer = csv.writer(outfile)

        # Write up to max_entries_per_month from each month
        for entries in month_entries.values():
            for row in entries[:max_entries_per_month]:
                writer.writerow(row)



# Specify the input and output file paths
input_file_path = 'results - revised.csv'
output_file_path = 'output - revised.csv'

# Specify the date column index (0-based, assuming the date is in the 4th column)
date_column_index = 3

# Define the start and end dates for the range
start_date = datetime.strptime('2024-04-01', '%Y-%m-%d')
end_date = datetime.strptime('2025-03-31', '%Y-%m-%d')

# Specify the maximum number of entries per month
max_entries_per_month = 5

# Call the function to filter the CSV file
filter_and_limit_rows_by_month(input_file_path, output_file_path, date_column_index, start_date, end_date, max_entries_per_month)





