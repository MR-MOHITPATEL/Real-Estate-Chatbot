from __future__ import annotations

import os
import re
from typing import Dict, Iterable, List, Optional, Tuple

import pandas as pd
from django.conf import settings
from openai import OpenAI, OpenAIError

DEFAULT_METRIC = "flat - weighted average rate"

METRIC_KEYWORDS = {
    "price": "flat - weighted average rate",
    "rate": "flat - weighted average rate",
    "trend": "flat - weighted average rate",
    "sales": "total sales - igr",
    "inventory": "total units",
    "supply": "total units",
    "units": "total units",
    "demand": "flat total",
    "commercial": "commercial_sold - igr",
    "office": "office total",
    "shop": "shop total",
}


def load_dataset(uploaded_file=None) -> pd.DataFrame:
    """
    Load the dataset from disk or from the uploaded file.
    """
    if uploaded_file:
        df = pd.read_excel(uploaded_file)
    else:
        dataset_path = settings.REAL_ESTATE_DATA_FILE
        if not dataset_path or not os.path.exists(dataset_path):
            raise FileNotFoundError("Default dataset could not be located.")
        df = pd.read_excel(dataset_path)

    df = df.rename(
        columns={
            "final location": "final_location",
            "year": "year",
            "total units": "total_units",
        }
    )
    df["final_location"] = df["final_location"].astype(str)
    df["year"] = df["year"].astype(int)
    return df


def extract_locations(query: str, available_locations: Iterable[str]) -> List[str]:
    lowered_query = query.lower()
    matches = [
        loc for loc in available_locations if loc and loc.lower() in lowered_query
    ]
    # De-duplicate while preserving order
    seen = set()
    filtered = []
    for loc in matches:
        canonical = loc.lower()
        if canonical not in seen:
            filtered.append(loc)
            seen.add(canonical)
    return filtered[:4]  # keep the response concise


def extract_years(query: str) -> List[int]:
    years = re.findall(r"(?:19|20)\d{2}", query)
    return sorted({int(year) for year in years})


def detect_metric(query: str) -> str:
    lower_query = query.lower()
    for keyword, column in METRIC_KEYWORDS.items():
        if keyword in lower_query:
            return column
    return DEFAULT_METRIC


def build_chart_data(
    df: pd.DataFrame,
    locations: List[str],
    years: List[int],
    metric_column: str,
) -> Tuple[Dict, str, List[str]]:
    if not years:
        years = sorted(df["year"].unique())

    if not locations:
        locations = [str(loc) for loc in df["final_location"].unique().tolist()[:2]]

    labels = [str(year) for year in years]
    datasets = []
    for loc in locations:
        subset = df[df["final_location"].str.lower() == loc.lower()]
        data = []
        for year in years:
            value_series = subset.loc[subset["year"] == year, metric_column]
            if value_series.empty:
                data.append(None)
            else:
                val = value_series.iloc[0]
                data.append(round(float(val), 2) if pd.notnull(val) else None)
        datasets.append({"label": f"{loc} ({metric_column})", "data": data})

    chart_type = "bar" if len(locations) > 1 and len(years) <= 1 else "line"
    return {"labels": labels, "datasets": datasets}, chart_type, locations


def build_table_data(df: pd.DataFrame, metric_column: str, limit: int = 50) -> List[Dict]:
    columns = [
        "final_location",
        "year",
        metric_column,
    ]
    if "total_units" in df.columns:
        columns.append("total_units")
    if "total sales - igr" in df.columns:
        columns.append("total sales - igr")

    subset = df[columns].copy()
    subset = subset.sort_values(by=["final_location", "year"]).head(limit)
    subset = subset.rename(
        columns={
            metric_column: "metric_value",
            "total sales - igr": "total_sales",
        }
    )
    subset = subset.where(pd.notnull(subset), None)
    return subset.to_dict(orient="records")


def build_mock_summary(query: str, df: pd.DataFrame, locations: List[str], years: List[int], metric_column: str) -> str:
    metric_label = metric_column.replace("_", " ").title()
    loc_text = ", ".join(locations) if locations else "top performing micro-markets"
    if len(years) >= 2:
        span = f"{years[0]} – {years[-1]}"
    elif years:
        span = str(years[0])
    else:
        span = "recent years"

    metric_values = df[metric_column].dropna()
    if metric_values.empty:
        trend_note = "Data is sparse, but the selection still reveals interesting pockets of activity."
    else:
        start = metric_values.iloc[0]
        end = metric_values.iloc[-1]
        delta = end - start
        direction = "growth" if delta >= 0 else "softening"
        trend_note = f"{direction.capitalize()} of {abs(delta):,.0f} units between the first and last period in view."

    return (
        f"Focused on **{loc_text}** for {span}, highlighting the `{metric_label}` metric. "
        f"{trend_note} Query: _{query.strip()}_."
    )


def build_summary_with_openai(prompt: str) -> Optional[str]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    try:
        client = OpenAI(api_key=api_key)
    except Exception:
        return None

    model = os.getenv("OPENAI_MODEL") or getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
    try:
        response = client.responses.create(
            model=model,
            input=prompt,
        )
        output = response.output[0].content[0].text  # type: ignore[attr-defined]
        return output.strip()
    except OpenAIError:
        return None
    except Exception:
        return None


def analyze_query(query: str, uploaded_file=None) -> Dict:
    if not query:
        raise ValueError("Query is required.")

    df = load_dataset(uploaded_file=uploaded_file)
    locations = extract_locations(query, df["final_location"].unique())
    years = extract_years(query)
    metric_column = detect_metric(query)
    if metric_column not in df.columns:
        metric_column = DEFAULT_METRIC if DEFAULT_METRIC in df.columns else df.select_dtypes(include="number").columns[0]

    filtered_df = df.copy()
    if locations:
        filtered_df = filtered_df[
            filtered_df["final_location"].str.lower().isin(
                [loc.lower() for loc in locations]
            )
        ]
    if years:
        filtered_df = filtered_df[filtered_df["year"].isin(years)]

    if filtered_df.empty:
        filtered_df = df[df["final_location"] == df["final_location"].iloc[0]].head(10)

    chart_data, chart_type, resolved_locations = build_chart_data(
        filtered_df, locations, years, metric_column
    )
    table_data = build_table_data(filtered_df, metric_column)

    prompt = (
        "You are a real estate analyst. Summarize the following insights in 3-4 sentences "
        "with a confident, executive tone and actionable language.\n"
        f"User Query: {query}\n"
        f"Locations: {', '.join(resolved_locations) or 'Top Markets'}\n"
        f"Years: {', '.join(chart_data['labels'])}\n"
        f"Metric: {metric_column}\n"
        f"Sample Rows: {table_data[:3]}\n"
    )
    summary = build_summary_with_openai(prompt) or build_mock_summary(
        query, filtered_df, resolved_locations, years, metric_column
    )

    return {
        "summary": summary,
        "chart_data": chart_data,
        "table_data": table_data,
        "chart_type": chart_type,
    }


