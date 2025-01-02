import pandas as pd
import json
import os
import sys
from infer_data_type import infer_data_type, match_salesforce_field_type
from utils import validate_csv, create_output_dir

def process_csv(input_csv_path, output_json_path):
    # Step 1: Validate CSV File
    if not validate_csv(input_csv_path):
        print(f"Error: The file {input_csv_path} is not a valid CSV.")
        sys.exit(1)

    # Step 2: Create Output Directory if it doesn't exist
    create_output_dir(os.path.dirname(output_json_path))

    # Step 3: Read the CSV file into a DataFrame
    try:
        df = pd.read_csv(input_csv_path)
        print(f"CSV Data Read Successfully! Here's a preview:")
        print(df.head())  # Print first few rows to inspect the data
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        sys.exit(1)

    # Step 4: Infer Salesforce field type for each column
    output_data = {}

    for column in df.columns:
        inferred_type = infer_data_type(df[column])
        salesforce_type = match_salesforce_field_type(inferred_type)
        output_data[column] = salesforce_type

    # Step 5: Create the output JSON file
    try:
        with open(output_json_path, 'w') as json_file:
            json.dump(output_data, json_file, indent=4)
        print(f"Salesforce data types successfully mapped and saved to {output_json_path}")
    except Exception as e:
        print(f"Error during JSON saving: {e}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python process_csv.py <input_csv_path> <output_json_path>")
        sys.exit(1)
    
    input_csv = sys.argv[1]
    output_json = sys.argv[2]
    
    process_csv(input_csv, output_json)
