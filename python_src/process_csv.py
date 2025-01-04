import json
import os
import sys
from datetime import datetime
from uuid import uuid4

import pandas as pd
from encoding_utils import convert_to_utf8
from infer_data_type import infer_data_type, match_salesforce_field_type

from utils import create_output_dir, validate_csv


def generate_unique_filename(output_dir, input_csv_path, extension=".json"):
    """Generate a unique filename by appending timestamp and UUID to the original file name."""
    # Extract the base name (without extension) and append the timestamp and UUID
    base_name = os.path.splitext(os.path.basename(input_csv_path))[0]
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = uuid4().hex[:6]  # Short unique identifier
    filename = f"{base_name}_{timestamp}_{unique_id}{extension}"
    return os.path.join(output_dir, filename)


def process_csv(
    input_csv_path, output_dir, chunksize=500
):  # Changed default chunksize to 500
    # Step 1: Validate CSV File
    if not validate_csv(input_csv_path):
        print(f"Error: The file {input_csv_path} is not a valid CSV.")
        sys.exit(1)

    # Step 2: Create Output Directory if it doesn't exist
    create_output_dir(output_dir)

    # Step 3: Convert file to UTF-8 if necessary
    utf8_csv_path = os.path.join(output_dir, "utf8_" + os.path.basename(input_csv_path))
    try:
        convert_to_utf8(input_csv_path, utf8_csv_path)
    except Exception as e:
        print(f"Failed to process encoding: {e}")
        sys.exit(1)

    # Step 4: Process CSV in chunks
    output_data = {}
    object_name = os.path.splitext(os.path.basename(input_csv_path))[
        0
    ].lower()  # Object name from file name
    output_data[object_name] = {"objectName": object_name, "fields": []}

    try:
        for chunk in pd.read_csv(utf8_csv_path, chunksize=chunksize, low_memory=False):
            print(f"Processing chunk of size {len(chunk)} rows...")
            for column in chunk.columns:
                # Infer type for each column
                inferred_type = infer_data_type(chunk[column])
                salesforce_type = match_salesforce_field_type(inferred_type)

                # Add column to fields under the object
                output_data[object_name]["fields"].append(
                    {"fieldName": column, "fieldType": salesforce_type}
                )
    except Exception as e:
        print(f"Error reading CSV file in chunks: {e}")
        sys.exit(1)

    # Step 5: Generate a unique filename and save the output JSON
    output_json_path = generate_unique_filename(output_dir, input_csv_path)

    try:
        with open(output_json_path, "w") as json_file:
            json.dump(output_data, json_file, indent=4)
        print(
            f"Salesforce data types successfully mapped and saved to {output_json_path}"
        )
    except Exception as e:
        print(f"Error during JSON saving: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_csv.py <input_csv_path> <output_directory>")
        sys.exit(1)

    input_csv = sys.argv[1]
    output_directory = sys.argv[2]

    process_csv(input_csv, output_directory)
