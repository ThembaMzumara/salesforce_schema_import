import os


def validate_csv(file_path):
    """
    Simple CSV validation (check if file has a .csv extension).
    Can be extended for more rigorous validation if needed.
    """
    return file_path.lower().endswith(".csv")


def create_output_dir(output_dir):
    """
    Creates the output directory if it doesn't exist.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
