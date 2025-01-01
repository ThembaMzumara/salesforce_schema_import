import pandas as pd
import json
import os
import sys
import chardet
import time
from utils import validate_csv, create_output_dir

def detect_encoding(file_path):
    """Detect file encoding using chardet"""
    with open(file_path, 'rb') as f:
        raw_data = f.read()
        result = chardet.detect(raw_data)
        return result['encoding']

def convert_to_utf8(file_path, output_path):
    """Convert CSV file to UTF-8 encoding"""
    detected_encoding = detect_encoding(file_path)
    print(f"Detected encoding: {detected_encoding}")

    # Read the file with the detected encoding and write it in UTF-8
    with open(file_path, mode='r', encoding=detected_encoding) as infile:
        with open(output_path, mode='w', encoding='utf-8', newline='') as outfile:
            for line in infile:
                outfile.write(line)
    print(f"File converted to UTF-8 and saved as {output_path}")

def generate_unique_filename(base_path, extension):
    """Generate a unique filename based on the current timestamp"""
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    base_name = os.path.splitext(os.path.basename(base_path))[0]
    return os.path.join(os.path.dirname(base_path), f"{base_name}_{timestamp}{extension}")

def process_csv(input_csv_path, output_dir):
    # Step 1: Validate CSV File
    if not validate_csv(input_csv_path):
        print(f"Error: The file {input_csv_path} is not a valid CSV.")
        sys.exit(1)

    # Step 2: Create Output Directory if it doesn't exist
    create_output_dir(output_dir)

    # Step 3: Convert the CSV file to UTF-8 if needed
    utf8_csv_path = os.path.join(output_dir, "utf8_" + os.path.basename(input_csv_path))
    convert_to_utf8(input_csv_path, utf8_csv_path)

    # Step 4: Read the CSV file into a DataFrame (now in UTF-8)
    try:
        df = pd.read_csv(utf8_csv_path)
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        sys.exit(1)

    # Step 5: Convert DataFrame to JSON
    try:
        json_data = df.to_json(orient='records', lines=False)

        # Generate a unique output filename with timestamp
        json_filename = generate_unique_filename(output_dir + "/output", ".json")
        
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
