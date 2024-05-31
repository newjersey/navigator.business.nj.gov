#!/usr/bin/env python

import unittest
from find_contextual_links import *
import tempfile


class TestFindContextualLinks(unittest.TestCase):

    def test_parse_markdown_file(self):
        with tempfile.NamedTemporaryFile(suffix=".md") as tmp:
            # write some markdown content to the file
            with open(tmp.name, "w") as f:
                f.write("example data `This is a test | test-link` more example data\n")

            self.assertEqual(
                ["This is a test | test-link"], parse_markdown_file(tmp.name)
            )


if __name__ == "__main__":
    unittest.main()
