import pandas as pd
import datetime

def infer_data_type(column_data):
    """Infer the data type of the column based on its content."""
    # Check if all values are numeric
    if column_data.apply(pd.to_numeric, errors='coerce').notna().all():
        if column_data.apply(float.is_integer).all():
            return "Number"
        else:
            return "Currency"
    
    # Check if all values are dates
    try:
        pd.to_datetime(column_data)
        return "Date/Time"
    except:
        pass
    
    # Check if all values are booleans
    if column_data.apply(lambda x: isinstance(x, bool)).all():
        return "Checkbox"
    
    # Check for URL (simple heuristic)
    if column_data.apply(lambda x: isinstance(x, str) and x.startswith("http")).any():
        return "URL"
    
    # Check for emails (simple heuristic)
    if column_data.apply(lambda x: isinstance(x, str) and "@" in x).any():
        return "Email"
    
    # Check for phone numbers (simple heuristic)
    if column_data.apply(lambda x: isinstance(x, str) and x.replace("-", "").isdigit()).any():
        return "Phone"
    
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
        "Date/Time": "Date/Time",
        "Checkbox": "Checkbox",
        "URL": "URL",
        "Email": "Email",
        "Phone": "Phone",
        "Picklist": "Picklist",
        "Text": "Text"
    }
    return salesforce_types.get(inferred_type, "Text")
