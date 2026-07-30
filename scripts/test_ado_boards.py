#!/usr/bin/env python

import unittest

from ado_boards import (
    CURRENT_PROJECT,
    CURRENT_PROJECT_MIN_TICKET_ID,
    LEGACY_PROJECT,
    project_for_ticket,
    work_item_url,
)


class TestProjectForTicket(unittest.TestCase):
    def test_below_cutover_returns_legacy_project(self):
        self.assertEqual(
            project_for_ticket(CURRENT_PROJECT_MIN_TICKET_ID - 1), LEGACY_PROJECT
        )

    def test_at_cutover_returns_current_project(self):
        self.assertEqual(
            project_for_ticket(CURRENT_PROJECT_MIN_TICKET_ID), CURRENT_PROJECT
        )

    def test_above_cutover_returns_current_project(self):
        self.assertEqual(
            project_for_ticket(CURRENT_PROJECT_MIN_TICKET_ID + 1), CURRENT_PROJECT
        )

    def test_accepts_numeric_string(self):
        self.assertEqual(
            project_for_ticket(str(CURRENT_PROJECT_MIN_TICKET_ID)), CURRENT_PROJECT
        )

    def test_rejects_non_numeric_ticket_id(self):
        with self.assertRaises(ValueError):
            project_for_ticket("not-a-number")


class TestWorkItemUrl(unittest.TestCase):
    def test_legacy_url_encodes_project_spaces(self):
        url = work_item_url(CURRENT_PROJECT_MIN_TICKET_ID - 1)
        self.assertIn("Business%20First%20Stop", url)
        self.assertTrue(url.endswith(f"/{CURRENT_PROJECT_MIN_TICKET_ID - 1}"))

    def test_current_url_uses_current_project(self):
        url = work_item_url(CURRENT_PROJECT_MIN_TICKET_ID)
        self.assertIn(f"/{CURRENT_PROJECT}/", url)
        self.assertTrue(url.endswith(f"/{CURRENT_PROJECT_MIN_TICKET_ID}"))


if __name__ == "__main__":
    unittest.main()
