import datetime
import re

import pandas as pd

# Regex patterns for Salesforce data types
regex_patterns = {
    "Number": r"^-?\d+(\.\d+)?$",  # Matches integers and decimals
    "Currency": r"^\$?\d+(\.\d{1,2})?$",  # Matches currency format
    "Date": r"^\d{4}-\d{2}-\d{2}$",  # Matches date format YYYY-MM-DD
    "Date/Time": r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$",  # Matches date-time format
    "Email": r"^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$",  # Matches email format
    "Phone": r"^\+?\(?\d{1,4}\)?[\s\-]?\(?\d{1,4}\)?[\s\-]?\(?\d{1,4}\)?[\s\-]?\(?\d{1,4}\)?$",  # Matches phone format
    "URL": r"^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$",  # Matches URL format
    "Checkbox": r"^(true|false)$",  # Matches boolean values
    "Picklist": r"^[\w\s\-]+$",  # Matches a single option with alphanumeric characters, spaces, and hyphens.  # Example Picklist (replace with your options)
    "Picklist (Multi-select)": r"^((Red|Blue|Green|Yellow);)*$",  # Example Multi-select (replace with your options)
    "Text Area": r"^.{1,255}$",  # Matches text with max 255 characters
    "Text Area (Long)": r"^.{1,131072}$",  # Matches long text up to 131072 characters
    "Text Area (Rich)": r"<[^>]+>",  # Matches rich text with HTML tags
    "Geolocation": r"\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)",  # Matches geolocation in (lat, lon)
    "Auto Number": r"^[A-Za-z]{3}-\d{4}$",  # Matches Auto Number format
    "Percent": r"^\d{1,2}(\.\d{1,2})?%$",  # Matches percent format
}


def infer_data_type(column_data):
    """Infer the data type of the column based on its content."""
    # Ensure all data is numeric where possible
    numeric_data = pd.to_numeric(column_data, errors="coerce")

    # Check against regex patterns for known data types
    for field_type, pattern in regex_patterns.items():
        if column_data.apply(
            lambda x: isinstance(x, str) and re.match(pattern, str(x))
        ).any():
            return field_type

    # Check if all values are integers
    if (
        numeric_data.dropna()
        .apply(lambda x: x.is_integer() if isinstance(x, float) else False)
        .all()
    ):
        return "Number"

    # Check if all values are floats
    elif pd.api.types.is_float_dtype(numeric_data):
        return "Currency"

    # Check if all values are dates
    try:
        pd.to_datetime(column_data, errors="coerce")  # Validate date format
        return "Date/Time"
    except Exception:
        pass

    # Check if all values are booleans
    if column_data.apply(lambda x: isinstance(x, bool)).all():
        return "Checkbox"

    # Check if any value in the column is a picklist (text)
    if column_data.apply(lambda x: isinstance(x, str)).any():
        return "Picklist"

    # Default to Text
    return "Text"


def match_salesforce_field_type(inferred_type):
    """Map inferred data types to Salesforce field types."""
    salesforce_types = {
        "Number": "Number",
        "Currency": "Currency",
        "Date": "Date",
        "Date/Time": "Date/Time",
        "Checkbox": "Checkbox",
        "URL": "URL",
        "Email": "Email",
        "Phone": "Phone",
        "Picklist": "Picklist",
        "Picklist (Multi-select)": "Picklist (Multi-select)",
        "Text": "Text",
        "Text Area": "Text Area",
        "Text Area (Long)": "Text Area (Long)",
        "Text Area (Rich)": "Text Area (Rich)",
        "Auto Number": "Auto Number",
        "Percent": "Percent",
        "Geolocation": "Geolocation",
        "Formula": "Formula",
        "Roll-Up Summary": "Roll-Up Summary",
        "Lookup Relationship": "Lookup Relationship",
        "Master-Detail Relationship": "Master-Detail Relationship",
        "External Lookup Relationship": "External Lookup Relationship",
        "Indirect Lookup Relationship": "Indirect Lookup Relationship",
        "Hierarchy": "Hierarchy",
    }
    return salesforce_types.get(inferred_type, "Text")
