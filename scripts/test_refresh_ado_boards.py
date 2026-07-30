#!/usr/bin/env python

import unittest

from ado_boards import CURRENT_PROJECT, LEGACY_PROJECT
from refresh_ado_boards import best_cutover, exceptions_for_cutover


class TestBestCutover(unittest.TestCase):
    def test_finds_exact_cutover_with_no_stragglers(self):
        team_projects = {
            1: LEGACY_PROJECT,
            2: LEGACY_PROJECT,
            3: CURRENT_PROJECT,
            4: CURRENT_PROJECT,
        }
        cutover, misclassified = best_cutover(team_projects)
        self.assertEqual(cutover, 3)
        self.assertEqual(misclassified, 0)

    def test_minimizes_misclassification_when_boards_interleave(self):
        team_projects = {
            1: LEGACY_PROJECT,
            2: CURRENT_PROJECT,  # straggler
            3: LEGACY_PROJECT,  # straggler
            4: CURRENT_PROJECT,
        }
        cutover, misclassified = best_cutover(team_projects)
        # No single cutover classifies all 4 correctly; the best ones (2 or 4)
        # still misclassify exactly one of the two interleaved stragglers.
        self.assertEqual(misclassified, 1)
        self.assertIn(cutover, (2, 4))


class TestExceptionsForCutover(unittest.TestCase):
    def test_finds_stragglers_on_both_sides_of_cutover(self):
        team_projects = {
            1: LEGACY_PROJECT,
            2: CURRENT_PROJECT,  # below cutover, current straggler
            3: LEGACY_PROJECT,  # at/above cutover, legacy straggler
            4: CURRENT_PROJECT,
        }
        exceptions = exceptions_for_cutover(
            team_projects,
            cutover=3,
            previous_exceptions={"legacy": [], "current": []},
            scanned_ids={1, 2, 3, 4},
        )
        self.assertEqual(exceptions, {"legacy": [3], "current": [2]})

    def test_preserves_previous_exceptions_outside_scanned_range(self):
        exceptions = exceptions_for_cutover(
            team_projects={1: LEGACY_PROJECT},
            cutover=1,
            previous_exceptions={"legacy": [99999], "current": [88888]},
            scanned_ids={1},
        )
        self.assertIn(99999, exceptions["legacy"])
        self.assertIn(88888, exceptions["current"])

    def test_drops_previous_exceptions_inside_scanned_range_no_longer_found(self):
        """A ticket previously listed as an exception should not survive if a
        rescan of its id no longer finds it misclassified by the new cutover."""
        exceptions = exceptions_for_cutover(
            team_projects={5: CURRENT_PROJECT},
            cutover=1,
            previous_exceptions={"legacy": [5], "current": []},
            scanned_ids={5},
        )
        self.assertNotIn(5, exceptions["legacy"])


if __name__ == "__main__":
    unittest.main()
