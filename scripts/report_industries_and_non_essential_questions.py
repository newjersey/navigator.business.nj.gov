#!/usr/bin/env python

"""
This module processes industry roadmaps and their associated non-essential questions
to generate a report of questions, industries, and related task pages.
"""

from __future__ import annotations

from typing import List, Dict, Any
import json
import csv
from pathlib import Path
from dataclasses import dataclass
from functools import cache


@dataclass(frozen=True)
class NonEssentialQuestion:
    """Represents a non-essential question with its ID and add-on information."""

    id: str
    add_on: str


class RoadmapError(Exception):
    """Base exception for roadmap processing errors."""


class QuestionNotFoundError(RoadmapError):
    """Raised when a question ID cannot be found in the data."""


class RoadmapProcessor:
    """Handles the processing of roadmap data and generation of reports."""

    def __init__(self, base_path: Path | None = None) -> None:
        """
        Initialize the RoadmapProcessor with paths to required data files.

        Args:
            base_path: Base path to the content source directory. If None,
                      will use default relative to script location.

        Raises:
            FileNotFoundError: If required directories don't exist
        """
        script_dir = Path(__file__).resolve().parent
        self.base_path = (
            Path(base_path) if base_path else script_dir.parent / "content/src"
        )

        # Define and validate required paths
        self.neq_path = self.base_path / "roadmaps/nonEssentialQuestions.json"
        self.industries_path = self.base_path / "roadmaps/industries"
        self.addons_path = self.base_path / "roadmaps/add-ons"

        self._validate_paths()

    def _validate_paths(self) -> None:
        """Validate that all required paths exist."""
        required_paths = {
            "Non-essential questions file": self.neq_path,
            "Industries directory": self.industries_path,
            "Add-ons directory": self.addons_path,
        }

        missing_paths = [
            f"{name} at {path}"
            for name, path in required_paths.items()
            if not path.exists()
        ]

        if missing_paths:
            raise FileNotFoundError(
                f"Required paths not found: {', '.join(missing_paths)}"
            )

    @cache
    def get_add_on_for_question(self, question_id: str) -> str:
        """
        Retrieve the add-on ID for a given non-essential question ID.

        Args:
            question_id: The ID of the non-essential question

        Returns:
            str: The corresponding add-on ID

        Raises:
            QuestionNotFoundError: If the question ID is not found in the data
            FileNotFoundError: If the non-essential questions file is not found
        """
        try:
            with self.neq_path.open("r", encoding="utf-8") as neq_file:
                neq_data: Dict[str, List[Dict[str, str]]] = json.load(neq_file)

                for question in neq_data.get("nonEssentialQuestionsArray", []):
                    if question["id"] == question_id:
                        return question["addOn"]

                raise QuestionNotFoundError(
                    f"Question ID {question_id} not found in data"
                )
        except json.JSONDecodeError as e:
            raise RoadmapError(f"Invalid JSON in questions file: {e}")

    def get_tasks_for_question(self, question_id: str) -> List[str]:
        """
        Get all task IDs associated with a non-essential question.

        Args:
            question_id: The ID of the non-essential question

        Returns:
            List[str]: List of task IDs associated with the question

        Raises:
            FileNotFoundError: If the add-on file is not found
            RoadmapError: If there's an error processing the JSON data
        """
        add_on_id = self.get_add_on_for_question(question_id)
        addon_file = self.addons_path / f"{add_on_id}.json"

        try:
            with addon_file.open("r", encoding="utf-8") as add_on_file:
                data: Dict[str, List[Dict[str, Any]]] = json.load(add_on_file)
                roadmap_steps = data.get("roadmapSteps", [])
                return [
                    step.get("task") or step.get("licenseTask")
                    for step in roadmap_steps
                    if any(step.get(key) for key in ("task", "licenseTask"))
                ]
        except json.JSONDecodeError as e:
            raise RoadmapError(f"Invalid JSON in add-on file {addon_file}: {e}")

    def _process_industry_file(
        self, industry_file: Path, csv_writer: csv.writer
    ) -> None:
        """
        Process a single industry file and write its data to the CSV.

        Args:
            industry_file: Path to the industry JSON file
            csv_writer: CSV writer object to write the data
        """
        try:
            with industry_file.open("r", encoding="utf-8") as f:
                industry_data: Dict[str, Any] = json.load(f)
                name = industry_data.get("name", "")
                non_essential_ids = industry_data.get("nonEssentialQuestionsIds", [])

                if not non_essential_ids:
                    csv_writer.writerow([name, "", "", ""])
                    return

                for neq_id in non_essential_ids:
                    try:
                        task_ids = self.get_tasks_for_question(neq_id)
                        for task_id in task_ids:
                            csv_writer.writerow([name, "", neq_id, task_id])
                    except (FileNotFoundError, RoadmapError) as e:
                        print(f"Error processing question {neq_id}: {e}")

        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from file {industry_file.name}: {e}")

    def generate_report(self, output_file: Path) -> None:
        """
        Generate a CSV report of industries, their non-essential questions, and related tasks.

        Args:
            output_file: Path to the output CSV file

        Raises:
            FileNotFoundError: If the industries directory is not found
        """
        # Ensure output directory exists
        output_file = Path(output_file)
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with output_file.open("w", newline="", encoding="utf-8") as csvfile:
            csv_writer = csv.writer(csvfile)
            csv_writer.writerow(
                [
                    "Industry Name",
                    "Legal Structure",
                    "nonEssentialQuestionsId",
                    "Corresponding Task Pages",
                ]
            )

            for industry_file in self.industries_path.glob("*.json"):
                self._process_industry_file(industry_file, csv_writer)


def main() -> None:
    """Main entry point for the roadmap processing script."""
    script_dir = Path(__file__).resolve().parent
    output_file = (
        script_dir.parent / "report-industries-and-non-essential-questions.csv"
    )

    try:
        processor = RoadmapProcessor()
        processor.generate_report(output_file)
        print(f"Report generated successfully at {output_file}")
    except Exception as e:
        print(f"Error generating report: {e}")
        raise


if __name__ == "__main__":
    main()
