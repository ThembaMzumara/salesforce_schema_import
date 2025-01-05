import datetime
import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd


@dataclass
class FieldAnalysis:
    """Data class to store field analysis results"""

    field_name: str
    suggested_type: str
    confidence: float
    pattern: str
    sample_values: List[str]
    unique_ratio: float
    null_ratio: float
    validation_pattern: str


class EnhancedSalesforceValidator:
    """Enhanced Salesforce data type validator with modern pattern matching and analysis"""

    def __init__(self):
        # Updated regex patterns with proper anchoring
        self.patterns = {
            "Auto Number": r"(?i)^[A-Za-z0-9\-]+$",
            "Checkbox": r"(?i)^(true|false|1|0|yes|no|y|n)$",
            "Currency": r"^[-+]?\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?$",
            "Date": r"^\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])$",
            "Date/Time": r"^\d{4}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[-+]\d{2}:?\d{2})?)?$",
            "Email": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
            "Geolocation": r"^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$",
            "Number": r"^[-+]?\d*\.?\d+$",
            "Percent": r"^[-+]?\d*\.?\d+%?$",
            "Phone": r"^\+?[0-9()\-\s\.]+$",
            "Text": r"^[\s\S]{0,255}$",
            "Text Area": r"^[\s\S]{0,255}$",
            "Text Area (Long)": r"^[\s\S]{0,131072}$",
            "Text Area (Rich)": r"^[\s\S]*$",
            "URL": r"^https?://.+$",
        }

    def analyze_field(self, field_name: str, data: pd.Series) -> FieldAnalysis:
        """Analyze a field and determine its likely Salesforce data type"""
        # Handle empty series
        if len(data) == 0:
            return FieldAnalysis(
                field_name=field_name,
                suggested_type="Text",
                confidence=0.0,
                pattern="",
                sample_values=[],
                unique_ratio=0.0,
                null_ratio=1.0,
                validation_pattern=self.patterns["Text"],
            )

        # Clean data
        clean_data = data.astype(str).replace({"nan": None, "None": None, "NaN": None})
        non_null_mask = clean_data.notna()
        non_null_values = clean_data[non_null_mask]

        # Calculate basic statistics
        total_values = len(data)
        null_ratio = (
            1 - (len(non_null_values) / total_values) if total_values > 0 else 1.0
        )
        unique_ratio = (
            len(non_null_values.unique()) / len(non_null_values)
            if len(non_null_values) > 0
            else 0.0
        )

        # If all values are null, return Text type
        if len(non_null_values) == 0:
            return FieldAnalysis(
                field_name=field_name,
                suggested_type="Text",
                confidence=1.0,
                pattern="",
                sample_values=[],
                unique_ratio=0.0,
                null_ratio=1.0,
                validation_pattern=self.patterns["Text"],
            )

        # Test patterns and calculate scores
        type_scores = []
        for type_name, pattern in self.patterns.items():
            try:
                # Count pattern matches for non-null values
                matches = non_null_values.str.match(pattern, na=False)
                match_ratio = matches.mean() if len(matches) > 0 else 0.0

                # Add type-specific scoring adjustments
                score = match_ratio

                # Adjust scores based on field characteristics
                if (
                    type_name == "Number"
                    and pd.to_numeric(non_null_values, errors="coerce").notna().mean()
                    > 0.8
                ):
                    score += 0.2
                elif (
                    type_name == "Date"
                    and pd.to_datetime(non_null_values, errors="coerce").notna().mean()
                    > 0.8
                ):
                    score += 0.2
                elif type_name == "Checkbox" and set(
                    non_null_values.str.lower()
                ).issubset({"true", "false", "1", "0", "yes", "no"}):
                    score += 0.3
                elif type_name == "Text Area" and non_null_values.str.len().max() > 255:
                    score += 0.3

                type_scores.append((type_name, score))
            except Exception as e:
                continue

        # Select best match
        if not type_scores:
            # Default to Text if no patterns match
            best_type = "Text"
            confidence = 1.0
        else:
            best_type, confidence = max(type_scores, key=lambda x: x[1])

        return FieldAnalysis(
            field_name=field_name,
            suggested_type=best_type,
            confidence=confidence,
            pattern=self.patterns[best_type],
            sample_values=non_null_values.head(5).tolist(),
            unique_ratio=unique_ratio,
            null_ratio=null_ratio,
            validation_pattern=self.patterns[best_type],
        )


def analyze_dataframe(df: pd.DataFrame) -> Dict[str, FieldAnalysis]:
    """Analyze all fields in a dataframe and return their Salesforce data types"""
    validator = EnhancedSalesforceValidator()
    results = {}

    for column in df.columns:
        try:
            results[column] = validator.analyze_field(column, df[column])
        except Exception as e:
            print(f"Error analyzing column {column}: {str(e)}")
            # Provide a default Text analysis for failed columns
            results[column] = FieldAnalysis(
                field_name=column,
                suggested_type="Text",
                confidence=0.0,
                pattern="",
                sample_values=[],
                unique_ratio=0.0,
                null_ratio=1.0,
                validation_pattern=r"^[\s\S]{0,255}$",
            )

    return results


def generate_field_mapping_report(
    analysis_results: Dict[str, FieldAnalysis]
) -> pd.DataFrame:
    """
    Generate a detailed report of field mappings

    Args:
        analysis_results: Dictionary of FieldAnalysis results

    Returns:
        DataFrame containing the field mapping report
    """
    report_data = []
    for field_name, analysis in analysis_results.items():
        report_data.append(
            {
                "Field Name": field_name,
                "Suggested Type": analysis.suggested_type,
                "Confidence": f"{analysis.confidence:.2%}",
                "Unique Ratio": f"{analysis.unique_ratio:.2%}",
                "Null Ratio": f"{analysis.null_ratio:.2%}",
                "Sample Values": ", ".join(str(x) for x in analysis.sample_values[:3]),
                "Validation Pattern": analysis.validation_pattern,
            }
        )

    return pd.DataFrame(report_data)
