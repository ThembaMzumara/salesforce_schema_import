import chardet

def detect_encoding(file_path):
    """Detect the file encoding using chardet."""
    with open(file_path, 'rb') as file:
        raw_data = file.read()
        result = chardet.detect(raw_data)
        return result['encoding']

def convert_to_utf8(input_path, output_path):
    """Convert the input file to UTF-8 encoding."""
    detected_encoding = detect_encoding(input_path)
    print(f"Detected file encoding: {detected_encoding}")

    try:
        with open(input_path, mode='r', encoding=detected_encoding) as source_file:
            with open(output_path, mode='w', encoding='utf-8') as target_file:
                for line in source_file:
                    target_file.write(line)
        print(f"File successfully converted to UTF-8: {output_path}")
    except Exception as e:
        print(f"Error during UTF-8 conversion: {e}")
        raise
