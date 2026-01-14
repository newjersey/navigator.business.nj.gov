#!/usr/bin/env python

import os
import sys
import tempfile
import unittest
from unittest.mock import patch

from generate_ado_link import (
    ADO_BASE_URL,
    extract_first_line,
    format_ado_link,
    format_pr_title,
    main,
    unescape_quotes,
    write_github_output,
)


class TestFormatAdoLink(unittest.TestCase):
    """Tests for the format_ado_link function."""

    def test_creates_slack_formatted_link(self):
        result = format_ado_link("AB#1234", "1234")
        expected = f"<{ADO_BASE_URL}/1234|AB#1234>"
        self.assertEqual(result, expected)

    def test_handles_different_ticket_numbers(self):
        result = format_ado_link("AB#9999", "9999")
        self.assertIn("9999", result)
        self.assertIn("AB#9999", result)


class TestExtractFirstLine(unittest.TestCase):
    """Tests for the extract_first_line function."""

    def test_single_line_unchanged(self):
        result = extract_first_line("Single line")
        self.assertEqual(result, "Single line")

    def test_extracts_first_line_from_multiline_unix(self):
        result = extract_first_line("First line\nSecond line\nThird line")
        self.assertEqual(result, "First line")

    def test_extracts_first_line_from_multiline_windows(self):
        result = extract_first_line("Title\r\nDescription")
        self.assertEqual(result, "Title")

    def test_extracts_first_line_from_multiline_old_mac(self):
        result = extract_first_line("Title\rDescription")
        self.assertEqual(result, "Title")

    def test_handles_empty_string(self):
        result = extract_first_line("")
        self.assertEqual(result, "")

    def test_handles_only_newline(self):
        result = extract_first_line("\n")
        self.assertEqual(result, "")

    def test_preserves_first_line_with_ticket_reference(self):
        result = extract_first_line("AB#1234 Fix bug\nDetailed description here")
        self.assertEqual(result, "AB#1234 Fix bug")


class TestFormatPrTitle(unittest.TestCase):
    """Tests for the format_pr_title function."""

    def test_replaces_single_ticket_reference(self):
        pr_title = "AB#1234 Fix login bug"
        result = format_pr_title(pr_title)
        self.assertIn(f"<{ADO_BASE_URL}/1234|AB#1234>", result)
        self.assertIn("Fix login bug", result)

    def test_replaces_multiple_ticket_references(self):
        pr_title = "AB#1234 AB#5678 Multiple fixes"
        result = format_pr_title(pr_title)
        self.assertIn(f"<{ADO_BASE_URL}/1234|AB#1234>", result)
        self.assertIn(f"<{ADO_BASE_URL}/5678|AB#5678>", result)

    def test_returns_unchanged_title_without_ticket(self):
        pr_title = "Fix login bug without ticket"
        result = format_pr_title(pr_title)
        self.assertEqual(result, pr_title)

    def test_handles_ticket_at_end_of_title(self):
        pr_title = "Fix login bug AB#1234"
        result = format_pr_title(pr_title)
        self.assertIn(f"<{ADO_BASE_URL}/1234|AB#1234>", result)
        self.assertIn("Fix login bug", result)

    def test_handles_ticket_in_middle_of_title(self):
        pr_title = "Fix AB#1234 login bug"
        result = format_pr_title(pr_title)
        self.assertIn(f"<{ADO_BASE_URL}/1234|AB#1234>", result)

    def test_empty_title(self):
        result = format_pr_title("")
        self.assertEqual(result, "")

    def test_ignores_malformed_ticket_references(self):
        pr_title = "AB# without number"
        result = format_pr_title(pr_title)
        self.assertEqual(result, pr_title)


class TestWriteGithubOutput(unittest.TestCase):
    """Tests for the write_github_output function."""

    def test_writes_key_value_to_file(self):
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as temp_file:
            temp_file_path = temp_file.name

        try:
            os.environ["GITHUB_OUTPUT"] = temp_file_path
            write_github_output("pr_title", "Test Title")

            with open(temp_file_path) as output_file:
                content = output_file.read()

            self.assertEqual(content, "pr_title=Test Title\n")
        finally:
            os.unlink(temp_file_path)

    def test_appends_to_existing_file(self):
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as temp_file:
            temp_file.write("existing=value\n")
            temp_file_path = temp_file.name

        try:
            os.environ["GITHUB_OUTPUT"] = temp_file_path
            write_github_output("pr_title", "Test Title")

            with open(temp_file_path) as output_file:
                content = output_file.read()

            self.assertIn("existing=value\n", content)
            self.assertIn("pr_title=Test Title\n", content)
        finally:
            os.unlink(temp_file_path)

    def test_prints_to_stdout_when_github_output_not_set(self):
        """Test that the function prints to stdout when GITHUB_OUTPUT is not set."""
        # Save and remove GITHUB_OUTPUT if it exists
        original_value = os.environ.get("GITHUB_OUTPUT")
        if "GITHUB_OUTPUT" in os.environ:
            del os.environ["GITHUB_OUTPUT"]

        try:
            import io
            from contextlib import redirect_stdout

            stdout_buffer = io.StringIO()
            with redirect_stdout(stdout_buffer):
                write_github_output("pr_title", "Test Title")

            output = stdout_buffer.getvalue()
            self.assertEqual(output, "pr_title=Test Title\n")
        finally:
            # Restore original value if it existed
            if original_value is not None:
                os.environ["GITHUB_OUTPUT"] = original_value

    def test_writes_multiline_value_with_heredoc_format(self):
        """Test that multi-line values are written with heredoc format."""
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as temp_file:
            temp_file_path = temp_file.name

        try:
            os.environ["GITHUB_OUTPUT"] = temp_file_path
            write_github_output("message", "Line 1\nLine 2\nLine 3")

            with open(temp_file_path) as output_file:
                content = output_file.read()

            expected = "message<<EOF\nLine 1\nLine 2\nLine 3\nEOF\n"
            self.assertEqual(content, expected)
        finally:
            os.unlink(temp_file_path)
            if "GITHUB_OUTPUT" in os.environ:
                del os.environ["GITHUB_OUTPUT"]

    def test_prints_multiline_value_to_stdout_with_heredoc(self):
        """Test that multi-line values print to stdout with heredoc format."""
        original_value = os.environ.get("GITHUB_OUTPUT")
        if "GITHUB_OUTPUT" in os.environ:
            del os.environ["GITHUB_OUTPUT"]

        try:
            import io
            from contextlib import redirect_stdout

            stdout_buffer = io.StringIO()
            with redirect_stdout(stdout_buffer):
                write_github_output("message", "Line 1\nLine 2")

            output = stdout_buffer.getvalue()
            expected = "message<<EOF\nLine 1\nLine 2\nEOF\n"
            self.assertEqual(output, expected)
        finally:
            if original_value is not None:
                os.environ["GITHUB_OUTPUT"] = original_value


class TestUnescapeQuotes(unittest.TestCase):
    """Tests for the unescape_quotes function."""

    def test_unescapes_double_quotes(self):
        result = unescape_quotes('Title with \\"quotes\\"')
        self.assertEqual(result, 'Title with "quotes"')

    def test_unescapes_single_quotes(self):
        result = unescape_quotes("Title with \\'quotes\\'")
        self.assertEqual(result, "Title with 'quotes'")

    def test_handles_mixed_quotes(self):
        result = unescape_quotes(r"Title with \"double\" and \'single\'")
        self.assertEqual(result, "Title with \"double\" and 'single'")

    def test_handles_no_escaped_quotes(self):
        result = unescape_quotes("Title without escaped quotes")
        self.assertEqual(result, "Title without escaped quotes")

    def test_handles_empty_string(self):
        result = unescape_quotes("")
        self.assertEqual(result, "")


class TestMain(unittest.TestCase):
    """Tests for the main function."""

    def test_handles_single_quoted_argument(self):
        """Test with commit message passed as a single quoted argument."""
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as temp_file:
            temp_file_path = temp_file.name

        try:
            os.environ["GITHUB_OUTPUT"] = temp_file_path
            with patch.object(sys, "argv", ["script.py", "AB#1234 Fix bug"]):
                main()

            with open(temp_file_path) as output_file:
                content = output_file.read()

            self.assertIn("AB#1234", content)
            self.assertIn("Fix bug", content)
        finally:
            os.unlink(temp_file_path)
            if "GITHUB_OUTPUT" in os.environ:
                del os.environ["GITHUB_OUTPUT"]

    def test_handles_multiple_unquoted_arguments(self):
        """Test with commit message passed as multiple unquoted arguments."""
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as temp_file:
            temp_file_path = temp_file.name

        try:
            os.environ["GITHUB_OUTPUT"] = temp_file_path
            with patch.object(
                sys, "argv", ["script.py", "AB#5678", "Fix", "login", "bug"]
            ):
                main()

            with open(temp_file_path) as output_file:
                content = output_file.read()

            self.assertIn("AB#5678", content)
            self.assertIn("Fix login bug", content)
        finally:
            os.unlink(temp_file_path)
            if "GITHUB_OUTPUT" in os.environ:
                del os.environ["GITHUB_OUTPUT"]

    def test_handles_multiple_arguments_with_escaped_quotes(self):
        """Test multiple arguments with escaped quotes being properly handled."""
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as temp_file:
            temp_file_path = temp_file.name

        try:
            os.environ["GITHUB_OUTPUT"] = temp_file_path
            with patch.object(
                sys,
                "argv",
                ["script.py", "AB#9999", "Fix", '\\"special\\"', "bug"],
            ):
                main()

            with open(temp_file_path) as output_file:
                content = output_file.read()

            self.assertIn("AB#9999", content)
            self.assertIn("Fix", content)
            self.assertIn('"special"', content)
            self.assertIn("bug", content)
        finally:
            os.unlink(temp_file_path)
            if "GITHUB_OUTPUT" in os.environ:
                del os.environ["GITHUB_OUTPUT"]

    def test_handles_single_argument_with_escaped_quotes(self):
        """Test single quoted argument with escaped quotes."""
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as temp_file:
            temp_file_path = temp_file.name

        try:
            os.environ["GITHUB_OUTPUT"] = temp_file_path
            with patch.object(
                sys, "argv", ["script.py", 'AB#7777 Fix \\"quoted\\" bug']
            ):
                main()

            with open(temp_file_path) as output_file:
                content = output_file.read()

            self.assertIn("AB#7777", content)
            self.assertIn('"quoted"', content)
        finally:
            os.unlink(temp_file_path)
            if "GITHUB_OUTPUT" in os.environ:
                del os.environ["GITHUB_OUTPUT"]

    def test_handles_multiline_commit_message_extracts_first_line(self):
        """Test that multi-line commit messages only use the first line (title)."""
        with tempfile.NamedTemporaryFile(mode="w", delete=False) as temp_file:
            temp_file_path = temp_file.name

        try:
            os.environ["GITHUB_OUTPUT"] = temp_file_path
            # Simulate a commit message with title and description
            with patch.object(
                sys,
                "argv",
                [
                    "script.py",
                    "AB#5555 Fix authentication\nDetailed description here\nMore details",
                ],
            ):
                main()

            with open(temp_file_path) as output_file:
                content = output_file.read()

            # Should only contain the first line
            self.assertIn("AB#5555", content)
            self.assertIn("Fix authentication", content)
            # Should NOT contain description lines
            self.assertNotIn("Detailed description", content)
            self.assertNotIn("More details", content)
        finally:
            os.unlink(temp_file_path)
            if "GITHUB_OUTPUT" in os.environ:
                del os.environ["GITHUB_OUTPUT"]


if __name__ == "__main__":
    unittest.main()
