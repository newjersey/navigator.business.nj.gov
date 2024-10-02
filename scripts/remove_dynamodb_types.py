import json
import os


# Function to recursively strip DynamoDB types
def strip_dynamodb_types(data):
    if isinstance(data, dict):
        if len(data) == 1 and list(data.keys())[0] in {
            "S",
            "N",
            "BOOL",
            "M",
            "L",
            "SS",
            "NS",
            "BS",
        }:
            key = list(data.keys())[0]
            value = data[key]
            if key == "M":
                return strip_dynamodb_types(value)
            elif key == "L":
                return [strip_dynamodb_types(item) for item in value]
            else:
                return value
        else:
            return {k: strip_dynamodb_types(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [strip_dynamodb_types(item) for item in data]
    else:
        return data


# Function to process all files in a directory and output cleaned files
def process_dynamodb_dump(input_dir, output_dir):
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Iterate through all files in the input directory
    for filename in os.listdir(input_dir):
        print(f"Processing {filename}")
        input_file_path = os.path.join(input_dir, filename)
        output_file_path = os.path.join(
            output_dir, f"{filename}.json"
        )  # Same filename in output directory

        # Read the input file
        with open(input_file_path, "r") as f:
            data = json.load(f)
            # Strip the DynamoDB types
            cleaned_data = strip_dynamodb_types(data)

        # Write the cleaned data to the corresponding output file
        with open(output_file_path, "w") as out_f:
            json.dump(cleaned_data, out_f, indent=4)


# Example usage:
input_directory = ""
output_directory = ""
process_dynamodb_dump(input_directory, output_directory)
