import unittest
import os
import tempfile
import json
from find_unused_tasks import (
    find_unused_task_files,
)


class TestFindUnusedTaskFiles(unittest.TestCase):
    def setUp(self):
        # Create a temporary directory for test files
        self.temp_dir = tempfile.mkdtemp()
        self.roadmap_content = {
            "roadmapSteps": [
                {"task": "task1"},
                {"licenseTask": "license1"},
                {"task": "task2"},
            ],
            "modifications": [{"replaceWithFilename": "mod1"}],
        }

    def tearDown(self):
        # Clean up temporary files
        for root, dirs, files in os.walk(self.temp_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(self.temp_dir)

    def create_test_roadmap_file(self, directory: str, filename: str):
        dir_path = os.path.join(self.temp_dir, directory)
        os.makedirs(dir_path, exist_ok=True)
        file_path = os.path.join(dir_path, filename)
        with open(file_path, "w") as f:
            json.dump(self.roadmap_content, f)
        return file_path

    def create_test_markdown_file(self, filename: str):
        file_path = os.path.join(self.temp_dir, f"{filename}.md")
        with open(file_path, "w") as f:
            f.write("Test content")

    def test_find_unused_task_files_basic(self):
        """Test finding unused task files in a simple scenario"""
        # Create test directory structure and files
        roadmap_dir = "roadmaps"
        self.create_test_roadmap_file(roadmap_dir, "roadmap1.json")

        # Create markdown files (both used and unused)
        self.create_test_markdown_file("task1")
        self.create_test_markdown_file("task2")
        self.create_test_markdown_file("unused_task")
        self.create_test_markdown_file("another_unused")

        # Capture stdout to verify output
        import io
        import sys

        captured_output = io.StringIO()
        sys.stdout = captured_output

        # Execute the function with full path
        find_unused_task_files(os.path.join(self.temp_dir), [roadmap_dir])

        # Restore stdout
        sys.stdout = sys.__stdout__
        output = captured_output.getvalue()

        # Verify output contains unused files and doesn't contain used files
        self.assertIn("unused_task", output)
        self.assertIn("another_unused", output)
        self.assertNotIn("task1", output)
        self.assertNotIn("task2", output)

    def test_find_unused_task_files_empty_directory(self):
        """Test behavior with empty directories"""
        # Create empty directory
        os.makedirs(os.path.join(self.temp_dir, "roadmaps"))

        # Capture stdout
        import io
        import sys

        captured_output = io.StringIO()
        sys.stdout = captured_output

        # Execute the function with full path
        find_unused_task_files(os.path.join(self.temp_dir), ["roadmaps"])

        # Restore stdout
        sys.stdout = sys.__stdout__
        output = captured_output.getvalue()

        # Verify output is empty or contains appropriate message
        self.assertEqual(output.strip(), "Markdown files not in any roadmap:")

    def test_find_unused_task_files_no_markdown(self):
        """Test behavior when there are roadmaps but no markdown files"""
        # Create roadmap file but no markdown files
        self.create_test_roadmap_file("roadmaps", "roadmap1.json")

        # Capture stdout
        import io
        import sys

        captured_output = io.StringIO()
        sys.stdout = captured_output

        # Execute the function with full path
        find_unused_task_files(os.path.join(self.temp_dir), ["roadmaps"])

        # Restore stdout
        sys.stdout = sys.__stdout__
        output = captured_output.getvalue()

        # Verify output indicates no unused files
        self.assertTrue(
            output.strip().endswith("Markdown files not in any roadmap:"), True
        )


if __name__ == "__main__":
    unittest.main()
