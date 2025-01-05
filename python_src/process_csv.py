import json
import os
import sys
from datetime import datetime
from uuid import uuid4

import pandas as pd
from encoding_utils import convert_to_utf8
from infer_data_type import EnhancedSalesforceValidator, analyze_dataframe

from utils import create_output_dir, validate_csv


def generate_unique_filename(output_dir, input_csv_path, extension=".json"):
    """Generate a unique filename by appending timestamp and UUID to the original file name."""
    base_name = os.path.splitext(os.path.basename(input_csv_path))[0]
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = uuid4().hex[:6]  # Short unique identifier
    filename = f"{base_name}_{timestamp}_{unique_id}{extension}"
    return os.path.join(output_dir, filename)


def process_chunk_data(
    chunk: pd.DataFrame, validator: EnhancedSalesforceValidator
) -> list:
    """Process a chunk of data and return field type mappings."""
    fields = []
    try:
        # Clean column names - remove problematic characters
        chunk.columns = chunk.columns.str.strip().str.replace(r"[^\w\s-]", "_")

        # Analyze the dataframe
        analysis_results = analyze_dataframe(chunk)

        # Process results
        for column, analysis in analysis_results.items():
            fields.append(
                {
                    "fieldName": column,
                    "fieldType": analysis.suggested_type,
                    "confidence": f"{analysis.confidence:.2%}",
                    "nullRatio": f"{analysis.null_ratio:.2%}",
                    "uniqueRatio": f"{analysis.unique_ratio:.2%}",
                    "validationPattern": analysis.validation_pattern,
                    "sampleValues": (
                        analysis.sample_values[:3] if analysis.sample_values else []
                    ),
                }
            )
    except Exception as e:
        print(f"Error processing chunk: {str(e)}")
        return []

    return fields


def process_csv(input_csv_path, output_dir, chunksize=500):
    """Process CSV file and generate Salesforce field mappings."""
    try:
        # Step 1: Validate CSV File
        if not validate_csv(input_csv_path):
            print(f"Error: The file {input_csv_path} is not a valid CSV.")
            sys.exit(1)

        # Step 2: Create Output Directory if it doesn't exist
        create_output_dir(output_dir)

        # Step 3: Convert file to UTF-8 if necessary
        utf8_csv_path = os.path.join(
            output_dir, "utf8_" + os.path.basename(input_csv_path)
        )
        try:
            convert_to_utf8(input_csv_path, utf8_csv_path)
        except Exception as e:
            print(f"Failed to process encoding: {e}")
            sys.exit(1)

        # Step 4: Initialize validator and output data
        validator = EnhancedSalesforceValidator()
        output_data = {}
        object_name = os.path.splitext(os.path.basename(input_csv_path))[0].lower()
        output_data[object_name] = {
            "objectName": object_name,
            "fields": [],
            "analysis": {
                "totalChunks": 0,
                "totalRows": 0,
                "processedAt": datetime.now().isoformat(),
                "status": "pending",
            },
        }

        # Step 5: Process CSV in chunks
        chunk_count = 0
        total_rows = 0

        # First pass to get field mappings
        first_chunk = pd.read_csv(utf8_csv_path, nrows=chunksize, low_memory=False)
        output_data[object_name]["fields"] = process_chunk_data(first_chunk, validator)

        if not output_data[object_name]["fields"]:
            raise Exception("Failed to analyze fields in the first chunk")

        # Second pass to count rows
        for chunk in pd.read_csv(utf8_csv_path, chunksize=chunksize, low_memory=False):
            chunk_count += 1
            total_rows += len(chunk)
            print(f"Processing chunk {chunk_count} with {len(chunk)} rows...")

        # Update analysis information
        output_data[object_name]["analysis"].update(
            {
                "totalChunks": chunk_count,
                "totalRows": total_rows,
                "averageChunkSize": total_rows / chunk_count if chunk_count > 0 else 0,
                "status": "completed",
                "totalFields": len(output_data[object_name]["fields"]),
            }
        )

        # Step 6: Generate a unique filename and save the output JSON
        output_json_path = generate_unique_filename(output_dir, input_csv_path)

        with open(output_json_path, "w") as json_file:
            json.dump(output_data, json_file, indent=4)
        print(
            f"Salesforce data types successfully mapped and saved to {output_json_path}"
        )

        # Print summary
        print("\nProcessing Summary:")
        print(f"Total chunks processed: {chunk_count}")
        print(f"Total rows processed: {total_rows}")
        print(f"Fields analyzed: {len(output_data[object_name]['fields'])}")
        print("Status: Completed")

    except Exception as e:
        print(f"Error during processing: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python process_csv.py <input_csv_path> <output_directory>")
        sys.exit(1)

    input_csv = sys.argv[1]
    output_directory = sys.argv[2]

    process_csv(input_csv, output_directory)
