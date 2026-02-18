#!/usr/bin/env python3

import json
import sys
from collections import defaultdict
from pathlib import Path

INDUSTRIES_DIR = Path(__file__).parent.parent / "src" / "roadmaps" / "industries"


def load_industry(file_path):
    """Parse one industry JSON file and extract its task IDs.

    Args:
        file_path: Path to the industry JSON file.

    Returns:
        A tuple of (name, id, frozenset of task IDs).
    """
    with open(file_path, encoding="utf-8") as f:
        data = json.load(f)

    task_ids = set()
    for step in data.get("roadmapSteps", []):
        task = step.get("task", "")
        if task:
            task_ids.add(task)
        license_task = step.get("licenseTask", "")
        if license_task:
            task_ids.add(license_task)

    industry_id = data.get("id", file_path.stem)
    name = data.get("name", industry_id)
    return name, industry_id, frozenset(task_ids)


def load_all_industries(directory):
    """Load all industry JSON files from a directory.

    Args:
        directory: Path to the industries directory.

    Returns:
        A list of (name, id, frozenset of task IDs) tuples.
    """
    industries = []
    for file_path in sorted(directory.glob("*.json")):
        try:
            industries.append(load_industry(file_path))
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Warning: skipping {file_path.name}: {e}", file=sys.stderr)
    return industries


def find_duplicate_groups(industries):
    """Group industries by identical task sets.

    Args:
        industries: List of (name, id, task_set) tuples.

    Returns:
        A list of (task_set, [(name, id), ...]) for groups with 2+ members,
        sorted by group size descending.
    """
    groups = defaultdict(list)
    for name, industry_id, task_set in industries:
        groups[task_set].append((name, industry_id))

    duplicates = [
        (task_set, members)
        for task_set, members in groups.items()
        if len(members) >= 2
    ]
    duplicates.sort(key=lambda g: len(g[1]), reverse=True)
    return duplicates


def print_report(groups, total):
    """Print a formatted report of duplicate industry groups.

    Args:
        groups: List of (task_set, members) tuples from find_duplicate_groups.
        total: Total number of industry files loaded.
    """
    if not groups:
        print("No duplicate industry groups found.")
        return

    involved = sum(len(members) for _, members in groups)
    print(f"\nFound {len(groups)} group(s) of industries with identical task sets")
    print(f"({involved} industries involved out of {total} total)")
    print("=" * 70)

    for i, (task_set, members) in enumerate(groups, 1):
        print(f"\nGroup {i} ({len(members)} industries, {len(task_set)} tasks):")
        print("  Industries:")
        for name, industry_id in sorted(members, key=lambda m: m[0]):
            print(f"    - {name} ({industry_id})")
        print("  Shared tasks:")
        for task_id in sorted(task_set):
            print(f"    - {task_id}")


def main():
    if not INDUSTRIES_DIR.is_dir():
        print(f"Error: directory not found: {INDUSTRIES_DIR}", file=sys.stderr)
        sys.exit(1)

    industries = load_all_industries(INDUSTRIES_DIR)
    print(f"Loaded {len(industries)} industry files from {INDUSTRIES_DIR.name}/")

    groups = find_duplicate_groups(industries)
    print_report(groups, len(industries))


if __name__ == "__main__":
    main()
