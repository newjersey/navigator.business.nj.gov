#!/usr/bin/env python

"""Unit tests for the industry roadmap report generator."""

import unittest
from pathlib import Path
import json
import tempfile
import shutil
from unittest.mock import patch

from report_industries_and_non_essential_questions import (
    RoadmapProcessor,
    NonEssentialQuestion,
    QuestionNotFoundError,
)


class TestRoadmapProcessor(unittest.TestCase):
    """Test cases for the RoadmapProcessor class."""

    def setUp(self):
        """Set up test fixtures."""
        # Create a temporary directory structure for testing
        self.test_dir = Path(tempfile.mkdtemp())
        self.content_dir = self.test_dir / "content/src"
        self.roadmaps_dir = self.content_dir / "roadmaps"

        # Create required directories
        (self.roadmaps_dir / "industries").mkdir(parents=True)
        (self.roadmaps_dir / "add-ons").mkdir(parents=True)

        # Create sample data
        self.sample_neq = {
            "nonEssentialQuestionsArray": [
                {"id": "test-q1", "addOn": "addon-1"},
                {"id": "test-q2", "addOn": "addon-2"},
            ]
        }

        self.sample_addon = {
            "roadmapSteps": [
                {"task": "task-1"},
                {"licenseTask": "license-1"},
                {"other": "ignored"},
            ]
        }

        self.sample_industry = {
            "name": "Test Industry",
            "nonEssentialQuestionsIds": ["test-q1"],
        }

        # Write sample files
        self._write_json(
            self.roadmaps_dir / "nonEssentialQuestions.json", self.sample_neq
        )
        self._write_json(self.roadmaps_dir / "add-ons/addon-1.json", self.sample_addon)
        self._write_json(
            self.roadmaps_dir / "industries/test-industry.json", self.sample_industry
        )

        # Initialize processor
        self.processor = RoadmapProcessor(self.content_dir)

    def tearDown(self):
        """Clean up test fixtures."""
        shutil.rmtree(self.test_dir)

    def _write_json(self, path: Path, data: dict):
        """Helper to write JSON files."""
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f)

    def test_initialization(self):
        """Test proper initialization of RoadmapProcessor."""
        self.assertTrue(self.processor.neq_path.exists())
        self.assertTrue(self.processor.industries_path.exists())
        self.assertTrue(self.processor.addons_path.exists())

    def test_initialization_with_invalid_path(self):
        """Test initialization with invalid path raises error."""
        with self.assertRaises(FileNotFoundError):
            RoadmapProcessor(Path("/nonexistent/path"))

    def test_get_add_on_for_question(self):
        """Test retrieving add-on ID for a question."""
        addon_id = self.processor.get_add_on_for_question("test-q1")
        self.assertEqual(addon_id, "addon-1")

    def test_get_add_on_for_nonexistent_question(self):
        """Test error handling for nonexistent question."""
        with self.assertRaises(QuestionNotFoundError):
            self.processor.get_add_on_for_question("nonexistent-q")

    def test_get_tasks_for_question(self):
        """Test retrieving tasks for a question."""
        tasks = self.processor.get_tasks_for_question("test-q1")
        self.assertEqual(tasks, ["task-1", "license-1"])

    def test_get_tasks_for_invalid_addon(self):
        """Test error handling for invalid add-on file."""
        with self.assertRaises(FileNotFoundError):
            self.processor.get_tasks_for_question(
                "test-q2"
            )  # addon-2.json doesn't exist

    def test_generate_report(self):
        """Test report generation."""
        output_file = self.test_dir / "test-report.csv"
        self.processor.generate_report(output_file)

        self.assertTrue(output_file.exists())

        # Verify content
        with output_file.open("r", encoding="utf-8") as f:
            content = f.readlines()

        # Check header
        self.assertTrue(any("Industry Name" in line for line in content))

        # Check data
        self.assertTrue(any("Test Industry" in line for line in content))
        self.assertTrue(any("test-q1" in line for line in content))
        self.assertTrue(any("task-1" in line for line in content))

    def test_generate_report_with_invalid_json(self):
        """Test report generation with invalid JSON in industry file."""
        invalid_industry_path = self.roadmaps_dir / "industries/invalid.json"
        with invalid_industry_path.open("w", encoding="utf-8") as f:
            f.write("invalid json")

        output_file = self.test_dir / "error-report.csv"

        # Should not raise exception but log error
        self.processor.generate_report(output_file)
        self.assertTrue(output_file.exists())

    @patch("builtins.print")
    def test_error_logging(self, mock_print):
        """Test error logging during report generation."""
        # Create industry file referencing nonexistent question
        invalid_industry = {
            "name": "Invalid Industry",
            "nonEssentialQuestionsIds": ["nonexistent-q"],
        }
        self._write_json(
            self.roadmaps_dir / "industries/invalid-industry.json", invalid_industry
        )

        output_file = self.test_dir / "error-log-report.csv"
        self.processor.generate_report(output_file)

        # Verify error was logged
        mock_print.assert_called_with(
            "Error processing question nonexistent-q: "
            "Question ID nonexistent-q not found in data"
        )


class TestNonEssentialQuestion(unittest.TestCase):
    """Test cases for the NonEssentialQuestion data class."""

    def test_creation(self):
        """Test creation of NonEssentialQuestion instance."""
        question = NonEssentialQuestion(id="test-id", add_on="test-addon")
        self.assertEqual(question.id, "test-id")
        self.assertEqual(question.add_on, "test-addon")

    def test_immutability(self):
        """Test that NonEssentialQuestion instances are immutable."""
        question = NonEssentialQuestion(id="test-id", add_on="test-addon")
        with self.assertRaises(AttributeError):
            question.id = "new-id"


if __name__ == "__main__":
    unittest.main()
