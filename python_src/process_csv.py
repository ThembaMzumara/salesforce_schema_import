import pandas as pd
import json
import os
import sys
from utils import validate_csv, create_output_dir

def process_csv(input_csv_path, output_dir):
    # Step 1: Validate CSV File
    if not validate_csv(input_csv_path):
        print(f"Error: The file {input_csv_path} is not a valid CSV.")
        sys.exit(1)

    # Step 2: Create Output Directory if it doesn't exist
    create_output_dir(output_dir)

    # Step 3: Read the CSV file into a DataFrame
    try:
        df = pd.read_csv(input_csv_path)
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        sys.exit(1)

    # Step 4: Convert DataFrame to JSON
    try:
        json_data = df.to_json(orient='records', lines=False)
        json_filename = os.path.join(output_dir, "output.json")
        
        with open(json_filename, 'w') as json_file:
            json.dump(json.loads(json_data), json_file, indent=4)
        
        print(f"CSV has been successfully converted to JSON and saved to {json_filename}")
    except Exception as e:
        print(f"Error during JSON conversion: {e}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python process_csv.py <input_csv_path> <output_directory>")
        sys.exit(1)
    
    input_csv = sys.argv[1]
    output_dir = sys.argv[2]
    
    process_csv(input_csv, output_dir)
