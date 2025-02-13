import csv
import os
import re

import pandas as pd


def combine_owners(row, owner_cols):
    return ", ".join(
        [str(val) for val in row[owner_cols] if pd.notna(val) and str(val).strip()]
    )


def combine_blockers(row, blocker_base_cols):
    blockers = []
    for base_col in blocker_base_cols:
        blocker = row[base_col]
        status_col = (
            f"{base_col} Status"
            if base_col == "Blocker"
            else f"Blocker Status{base_col[len('Blocker'):]}"
        )
        status = row[status_col]
        if (
            pd.notna(blocker)
            and pd.notna(status)
            and str(blocker).strip()
            and str(status).strip()
        ):
            if blocker != "nan" and status != "nan":
                blockers.append(f"{blocker}: {status}")
    return "\n".join(blockers) if blockers else ""


def combine_tasks(row, task_base_cols):
    tasks = []
    for base_col in task_base_cols:
        task = row[base_col]
        status_col = (
            f"{base_col} Status"
            if base_col == "Task"
            else f"Task Status{base_col[len('Task'):]}"
        )
        status = row[status_col]
        if (
            pd.notna(task)
            and pd.notna(status)
            and str(task).strip()
            and str(status).strip()
        ):
            if task != "nan" and status != "nan":
                tasks.append(f"{task}: {status}")
    return "\n".join(tasks) if tasks else ""


def combine_reviews(row, review_suffixes):
    reviews = []
    for suffix in review_suffixes:
        review_type = row[f"Review Type{suffix}"]
        reviewer = row[f"Reviewer{suffix}"]
        status = row[f"Review Status{suffix}"]
        if (
            pd.notna(review_type)
            and pd.notna(reviewer)
            and pd.notna(status)
            and str(review_type).strip()
            and str(reviewer).strip()
            and str(status).strip()
        ):
            if review_type != "nan" and reviewer != "nan" and status != "nan":
                reviews.append(f"{review_type} - {reviewer} - {status}")
    return "\n".join(reviews) if reviews else ""


def combine_simple_columns(row, cols):
    return "\n".join(
        [
            str(val)
            for val in row[cols]
            if pd.notna(val) and str(val).strip() and str(val) != "nan"
        ]
    )


def convert_newlines_to_html(text):
    if pd.isna(text):
        return text
    # Convert markdown line breaks to <br> tags
    # First, preserve double line breaks (paragraphs)
    text = re.sub(r"\n\s*\n", "<br><br>", str(text))
    # Then convert single line breaks
    text = re.sub(r"\n", "<br>", text)
    return text


# Read the CSV file
input_file = input("Enter the path to the input CSV file: ").strip()
is_accessibility = (
    input("Is this file related to the accessibility audit? (y/n): ").strip().lower()
)

df = pd.read_csv(
    input_file,
    lineterminator="\n",
    escapechar="\\",
    encoding="utf-8",
    quoting=csv.QUOTE_ALL,  # Force quoting of all fields
)

# Create Tags column with base value and existing Labels
df["Tags"] = "Pivotal Legacy Import"

# Add Labels (if they exist) and Accessibility Audit tag if applicable
df["Tags"] = df.apply(
    lambda row: ";".join(
        filter(
            None,
            [
                "Pivotal Legacy Import",
                (
                    str(row["Labels"]).replace(",", ";")
                    if pd.notna(row["Labels"]) and str(row["Labels"]).strip()
                    else None
                ),
                "Accessibility Audit" if is_accessibility == "y" else None,
            ],
        )
    ),
    axis=1,
)

# Drop the original Labels column
df = df.drop(columns=["Labels"])

# Filter out rows where Type is 'release'
df = df[df["Type"] != "release"]

# Transform type column to Work Item Type with title case
type_mapping = {
    "bug": "Bug",
    "chore": "Chore",
    "epic": "Epics",
    "feature": "User Story",
}

# Rename and transform the column
df["Work Item Type"] = df["Type"].map(type_mapping)
df = df.drop(columns=["Type"])
DEFAULT_MESSAGE = (
    "This is an import from Pivotal Tracker. This field was previously blank."
)

# Fill empty Description fields
df["Description"] = df["Description"].fillna(DEFAULT_MESSAGE)
df.loc[df["Description"].str.strip() == "", "Description"] = DEFAULT_MESSAGE


# Get base column names and their variations
def get_base_columns(columns, prefix):
    base_cols = []
    for col in columns:
        if col == prefix or (
            col.startswith(prefix + ".")
            and col[len(prefix) :].replace(".", "").isdigit()
        ):
            base_cols.append(col)
    return base_cols


def get_numbered_suffixes(columns, prefix):
    # Only return suffixes if the base column exists
    if not any(col.startswith(prefix) for col in columns):
        return []

    suffixes = [""]
    i = 1
    while f"{prefix}.{i}" in columns:
        suffixes.append(f".{i}")
        i += 1
    return suffixes


columns = df.columns.tolist()

# Identify columns for each category
comment_cols = get_base_columns(columns, "Comment")
owner_cols = get_base_columns(columns, "Owned By")
blocker_base_cols = get_base_columns(columns, "Blocker")
task_base_cols = get_base_columns(columns, "Task")
review_suffixes = get_numbered_suffixes(columns, "Review Type")
pr_cols = get_base_columns(columns, "Pull Request")
branch_cols = get_base_columns(columns, "Git Branch")

# Create new consolidated columns only if they exist in the input
df["Comments"] = (
    df[comment_cols].apply(
        lambda x: "\n-------------------\n".join(
            [str(val) for val in x if pd.notna(val) and str(val).strip()]
        ),
        axis=1,
    )
    if comment_cols
    else ""
)
df["Owners"] = (
    df.apply(lambda row: combine_owners(row, owner_cols), axis=1) if owner_cols else ""
)
df["Blockers"] = (
    df.apply(lambda row: combine_blockers(row, blocker_base_cols), axis=1)
    if blocker_base_cols
    else ""
)
df["Tasks"] = (
    df.apply(lambda row: combine_tasks(row, task_base_cols), axis=1)
    if task_base_cols
    else ""
)
df["Reviews"] = (
    df.apply(lambda row: combine_reviews(row, review_suffixes), axis=1)
    if review_suffixes
    else ""
)
df["Pull Requests"] = (
    df.apply(lambda row: combine_simple_columns(row, pr_cols), axis=1)
    if pr_cols
    else ""
)
df["Git Branches"] = (
    df.apply(lambda row: combine_simple_columns(row, branch_cols), axis=1)
    if branch_cols
    else ""
)

# Append Comments to Description with formatting
mask = df["Comments"].notna() & (df["Comments"].str.strip() != "")
df.loc[mask, "Description"] = df.loc[mask].apply(
    lambda row: f"{row['Description']}<br><br>## Comments<br><br>{row['Comments']}",
    axis=1,
)

# Add Repro Steps column - duplicate Description for Bug work items
df["Repro Steps"] = ""
mask = df["Work Item Type"] == "Bug"
df.loc[mask, "Repro Steps"] = df.loc[mask, "Description"]

# Fill empty Repro Steps fields for Bugs
df.loc[(mask) & (df["Repro Steps"].str.strip() == ""), "Repro Steps"] = DEFAULT_MESSAGE

# Convert both Description and Repro Steps newlines to HTML breaks
df["Description"] = df["Description"].apply(convert_newlines_to_html)
df["Repro Steps"] = df["Repro Steps"].apply(convert_newlines_to_html)

# Get all columns to drop
columns_to_drop = []
for col in columns:
    if (
        col.startswith("Comment")
        or col.startswith("Owned By")
        or col.startswith("Blocker")
        or col.startswith("Task")
        or col.startswith("Review Type")
        or col.startswith("Reviewer")
        or col.startswith("Review Status")
        or col.startswith("Pull Request")
        or col.startswith("Git Branch")
    ):
        columns_to_drop.append(col)

# Drop the original columns
df = df.drop(columns=columns_to_drop)

# Filter rows based on Current State values
df = df[df["Current State"].str.lower().isin(["finished", "delivered", "accepted"])]

# Sort by Id to ensure consistent splitting
df = df.sort_values("Id")

# Get base filename without extension for output files
base_filename = os.path.splitext(os.path.basename(input_file))[0]

# Create full version files
ITEMS_PER_FILE = 1000

df_first = df.iloc[:ITEMS_PER_FILE]
df_first.to_csv(
    f"{base_filename}-consolidated-1.csv",
    index=False,
    lineterminator="\n",
    quoting=csv.QUOTE_ALL,
    escapechar="\\",
    doublequote=True,
)

df_second = df.iloc[ITEMS_PER_FILE:]
if not df_second.empty:
    df_second.to_csv(
        f"{base_filename}-consolidated-2.csv",
        index=False,
        lineterminator="\n",
        quoting=csv.QUOTE_ALL,
        escapechar="\\",
        doublequote=True,
    )

# Create simplified version with Title, Work Item Type, Description, Repro Steps, and Tags
df_simple = df[["Title", "Work Item Type", "Description", "Repro Steps", "Tags"]]

# Split simplified version into chunks of 1000
df_simple_first = df_simple.iloc[:ITEMS_PER_FILE]
df_simple_first.to_csv(
    f"{base_filename}-simplified-1.csv",
    index=False,
    lineterminator="\n",
    quoting=csv.QUOTE_ALL,
    escapechar="\\",
    doublequote=True,
)

df_simple_second = df_simple.iloc[ITEMS_PER_FILE:]
if not df_simple_second.empty:
    df_simple_second.to_csv(
        f"{base_filename}-simplified-2.csv",
        index=False,
        lineterminator="\n",
        quoting=csv.QUOTE_ALL,
        escapechar="\\",
        doublequote=True,
    )

# Print stats
print(f"\nFull version stats:")
print(f"Total items: {len(df)}")
print(f"Items in first file: {len(df_first)}")
print(f"Items in second file: {len(df_second)}")

print(f"\nSimplified version stats:")
print(f"Total items: {len(df_simple)}")
print(f"Items in first file: {len(df_simple_first)}")
print(f"Items in second file: {len(df_simple_second)}")
