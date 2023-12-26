#!/usr/bin/env python

import unittest
from unittest.mock import mock_open, patch
from get_frontmatter_key import (
    extract_yaml_front_matter,
    get_value_from_yaml_key,
    get_yaml_value_from_markdown_file,
)

MARKDOWN_NO_FRONT_MATTER = """
# Heading
This is a Markdown document with no front matter.
"""

MARKDOWN_WITH_FRONT_MATTER = """
---
title: "Sample Document"
author: "John Doe"
---
# Heading
This is a Markdown document.
"""

EXAMPLE_YAML = 'title: "Sample Document"\nauthor: "John Doe"\n'


class TestYAMLExtraction(unittest.TestCase):
    def test_extract_yaml_front_matter(self):
        self.assertEqual(
            extract_yaml_front_matter(MARKDOWN_WITH_FRONT_MATTER), f"\n{EXAMPLE_YAML}"
        )

    def test_get_value_from_yaml_key(self):
        self.assertEqual(
            get_value_from_yaml_key(EXAMPLE_YAML, "title"), "Sample Document"
        )
        self.assertIsNone(get_value_from_yaml_key(EXAMPLE_YAML, "nonexistent_key"))

    @patch(
        "builtins.open",
        new_callable=mock_open,
        read_data=MARKDOWN_WITH_FRONT_MATTER,
    )
    def test_get_yaml_value_from_markdown_file(self, mock_file):
        file_path = "dummy_path.md"
        self.assertEqual(
            get_yaml_value_from_markdown_file(file_path, "author"), "John Doe"
        )
        self.assertIsNone(
            get_yaml_value_from_markdown_file(file_path, "nonexistent_key")
        )

    @patch(
        "builtins.open",
        new_callable=mock_open,
        read_data=MARKDOWN_NO_FRONT_MATTER,
    )
    def test_get_yaml_value_from_markdown_file_no_front_matter(self, mock_file):
        file_path = "dummy_path.md"
        self.assertIsNone(get_yaml_value_from_markdown_file(file_path, "title"))

    @patch("builtins.open", side_effect=FileNotFoundError)
    def test_get_yaml_value_from_markdown_file_not_found(self, mock_file):
        file_path = "nonexistent_path.md"
        self.assertIsNone(get_yaml_value_from_markdown_file(file_path, "title"))


if __name__ == "__main__":
    unittest.main()
