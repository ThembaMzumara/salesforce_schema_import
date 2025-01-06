import re
from dataclasses import dataclass
from typing import List, Optional, Tuple

import pandas as pd


@dataclass
class PatternComponent:
    """Represents a single component of a regex pattern."""

    name: str
    pattern: str
    description: str


@dataclass
class FieldAnalysis:
    """Analysis result for a field."""

    field_name: str
    suggested_type: str
    confidence: float
    pattern: str
    sample_values: List[str]
    unique_ratio: float
    null_ratio: float
    validation_pattern: Optional[str]


class PatternBuilder:
    """Builds regex patterns dynamically."""

    def __init__(self):
        self._components = {
            "integer": PatternComponent("integer", r"\\d+", "One or more digits"),
            "decimal": PatternComponent("decimal", r"\\.\\d+", "Decimal portion"),
            "negative": PatternComponent("negative", r"-?", "Optional negative sign"),
            "currency_symbol": PatternComponent(
                "currency_symbol", r"\\$?", "Optional currency symbol"
            ),
            "thousands_separator": PatternComponent(
                "thousands_separator", r"(,\\d{3})*", "Thousands separator"
            ),
            "alphanumeric": PatternComponent(
                "alphanumeric", r"[A-Za-z0-9]", "Letters and numbers"
            ),
            "letters_only": PatternComponent(
                "letters_only", r"[A-Za-z]", "Letters only"
            ),
            "whitespace": PatternComponent("whitespace", r"\\s", "Whitespace"),
            "special_chars": PatternComponent(
                "special_chars", r'[!@#$%^&*(),.?":{}|<>]', "Special characters"
            ),
            "email_local": PatternComponent(
                "email_local", r"[a-zA-Z0-9._%+-]+", "Email username"
            ),
            "email_domain": PatternComponent(
                "email_domain", r"[a-zA-Z0-9.-]+", "Email domain"
            ),
            "email_tld": PatternComponent(
                "email_tld", r"[a-zA-Z]{2,}", "Top-level domain"
            ),
            "year": PatternComponent("year", r"\\d{4}", "Four-digit year"),
            "month": PatternComponent("month", r"(0[1-9]|1[0-2])", "Two-digit month"),
            "day": PatternComponent("day", r"(0[1-9]|[12]\\d|3[01])", "Two-digit day"),
        }
        self._pattern_parts: List[str] = []
        self._anchored = False
        self._case_sensitive = True

    def add(self, component_name: str, repetitions: str = "") -> "PatternBuilder":
        if component_name in self._components:
            pattern = self._components[component_name].pattern
            if repetitions:
                pattern = f"({pattern}){repetitions}"
            self._pattern_parts.append(pattern)
        return self

    def literal(self, text: str) -> "PatternBuilder":
        self._pattern_parts.append(re.escape(text))
        return self

    def optional(self) -> "PatternBuilder":
        if self._pattern_parts:
            self._pattern_parts[-1] = f"({self._pattern_parts[-1]})?"
        return self

    def one_or_more(self) -> "PatternBuilder":
        if self._pattern_parts:
            self._pattern_parts[-1] = f"({self._pattern_parts[-1]})+"
        return self

    def zero_or_more(self) -> "PatternBuilder":
        if self._pattern_parts:
            self._pattern_parts[-1] = f"({self._pattern_parts[-1]})*"
        return self

    def anchor(self) -> "PatternBuilder":
        self._anchored = True
        return self

    def case_insensitive(self) -> "PatternBuilder":
        self._case_sensitive = False
        return self

    def build(self) -> str:
        pattern = "".join(self._pattern_parts)
        if self._anchored:
            pattern = f"^{pattern}$"
        return pattern


class EnhancedPatternValidator:
    """Creates and validates common Salesforce data patterns."""

    def __init__(self):
        self.builder = PatternBuilder()
        self.patterns = {
            "Text": r"^[A-Za-z0-9\s]+$",
            "Picklist": None,  # Will be dynamically generated
        }

    def create_number_pattern(self, allow_negative=True, allow_decimal=True) -> str:
        self.builder = PatternBuilder()
        if allow_negative:
            self.builder.add("negative")
        self.builder.add("integer")
        if allow_decimal:
            self.builder.add("decimal").optional()
        return self.builder.anchor().build()

    def create_currency_pattern(self) -> str:
        return (
            PatternBuilder()
            .add("negative")
            .add("currency_symbol")
            .add("integer")
            .add("thousands_separator")
            .add("decimal")
            .optional()
            .anchor()
            .build()
        )

    def create_email_pattern(self) -> str:
        return (
            PatternBuilder()
            .add("email_local")
            .literal("@")
            .add("email_domain")
            .literal(".")
            .add("email_tld")
            .anchor()
            .build()
        )

    def create_date_pattern(self, format_type="ISO") -> str:
        builder = PatternBuilder()
        if format_type == "ISO":
            return (
                builder.add("year")
                .literal("-")
                .add("month")
                .literal("-")
                .add("day")
                .anchor()
                .build()
            )
        return builder.build()

    def analyze_text_type(self, data: pd.Series) -> Tuple[str, float]:
        valid_values = data.dropna()
        total_values = len(valid_values)

        if total_values == 0:
            return "Text", 1.0

        unique_values = valid_values.nunique()
        unique_ratio = unique_values / total_values
        value_frequencies = valid_values.value_counts(normalize=True)

        picklist_indicators = {
            "low_unique_ratio": unique_ratio < 0.1,
            "high_frequency_values": (value_frequencies > 0.05).sum() >= 3,
            "manageable_unique_count": unique_values <= 100,
            "consistent_casing": len(valid_values.str.contains("[A-Z]").unique()) == 1,
        }

        confidence_score = sum(picklist_indicators.values()) / len(picklist_indicators)

        if confidence_score > 0.7:
            return "Picklist", confidence_score
        else:
            return "Text", 1 - confidence_score

    def create_picklist_pattern(self, data: pd.Series) -> str:
        common_values = data.value_counts().head(50)
        if len(common_values) == 0:
            return self.patterns["Text"]

        escaped_values = [re.escape(str(val)) for val in common_values.index]
        return f"^({'|'.join(escaped_values)})$"

    def analyze_text_field(self, field_name: str, data: pd.Series) -> FieldAnalysis:
        length_stats = {
            "max_length": data.str.len().max(),
            "avg_length": data.str.len().mean(),
            "std_length": data.str.len().std(),
        }

        value_distribution = {
            "unique_ratio": data.nunique() / len(data),
            "most_common_ratio": data.value_counts(normalize=True).max(),
        }

        picklist_name_patterns = [
            "status",
            "type",
            "category",
            "stage",
            "level",
            "priority",
            "rating",
            "class",
            "grade",
        ]

        name_indicators = any(
            indicator in field_name.lower() for indicator in picklist_name_patterns
        )

        picklist_score = 0
        if length_stats["std_length"] < 5:
            picklist_score += 0.3
        if value_distribution["unique_ratio"] < 0.1:
            picklist_score += 0.3
        if value_distribution["most_common_ratio"] > 0.2:
            picklist_score += 0.2
        if name_indicators:
            picklist_score += 0.2

        return FieldAnalysis(
            field_name=field_name,
            suggested_type="Picklist" if picklist_score > 0.5 else "Text",
            confidence=max(picklist_score, 1 - picklist_score),
            pattern=(
                self.create_picklist_pattern(data)
                if picklist_score > 0.5
                else self.patterns["Text"]
            ),
            sample_values=data.dropna().unique()[:5].tolist(),
            unique_ratio=value_distribution["unique_ratio"],
            null_ratio=data.isna().mean(),
            validation_pattern=None,
        )


# Example usage and testing
def test_pattern_builder():
    validator = EnhancedPatternValidator()
    test_cases = [
        (
            "number",
            validator.create_number_pattern(),
            [("123", True), ("-123.45", True), ("abc", False)],
        ),
        (
            "currency",
            validator.create_currency_pattern(),
            [("$123.45", True), ("$1,234.56", True), ("123", False)],
        ),
        (
            "email",
            validator.create_email_pattern(),
            [("user@example.com", True), ("invalid.email", False)],
        ),
        (
            "date",
            validator.create_date_pattern(),
            [("2024-03-15", True), ("2024/03/15", False)],
        ),
    ]

    for pattern_name, pattern, cases in test_cases:
        print(f"\nTesting {pattern_name} pattern: {pattern}")
        for test_value, expected in cases:
            result = bool(re.match(pattern, test_value))
            status = "\u2713" if result == expected else "\u2717"
            print(f"{status} {test_value}: got {result}, expected {expected}")


if __name__ == "__main__":
    test_pattern_builder()
