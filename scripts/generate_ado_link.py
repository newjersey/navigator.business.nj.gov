#!/usr/bin/env python
"""Format PR titles by converting Azure DevOps ticket references to Slack links.

This script processes Pull Request titles to convert Azure DevOps work item
references (AB#<number>) into Slack-formatted hyperlinks, making them clickable
in Slack notifications and messages.

Usage:
    Basic usage with quoted argument:
        $ python generate_ado_link.py "AB#1234 Fix login bug"

    Usage with unquoted arguments (automatically joins):
        $ python generate_ado_link.py AB#1234 Fix login bug

    With escaped quotes in the message:
        $ python generate_ado_link.py "AB#5678 Fix \\"special\\" bug"

    Multiple ticket references:
        $ python generate_ado_link.py "AB#1234 AB#5678 Multiple fixes"

Environment Variables:
    GITHUB_OUTPUT: Path to GitHub Actions output file. If not set, the script
                   prints results to stdout for local testing.

Output:
    When GITHUB_OUTPUT is set: Writes 'pr_title=<formatted_title>' to the file.
    When GITHUB_OUTPUT is not set: Prints 'pr_title=<formatted_title>' to stdout.

Examples:
    Input:  "AB#1234 Fix authentication bug"
    Output: pr_title=<https://dev.azure.com/.../1234|AB#1234> Fix authentication bug

    Input:  "Update docs AB#5678"
    Output: pr_title=Update docs <https://dev.azure.com/.../5678|AB#5678>

Notes:
    - Commit messages can be passed as a single quoted string or multiple unquoted arguments
    - Escaped quotes (\\\" or \\') in the message are automatically unescaped
    - Multiple AB# references in the same message are all converted to links
    - Non-matching text is preserved as-is
"""

from __future__ import annotations

import argparse
import os
import re
from pathlib import Path
from typing import Final

# Public API
__all__ = [
    "extract_first_line",
    "format_ado_link",
    "format_pr_title",
    "parse_arguments",
    "unescape_quotes",
    "write_github_output",
    "main",
]

# Constants
ADO_BASE_URL: Final[str] = (
    "https://dev.azure.com/NJInnovation/Business%20First%20Stop/_workitems/edit"
)
ADO_TICKET_PATTERN: Final[re.Pattern[str]] = re.compile(r"AB#(\d+)")


def extract_first_line(text: str) -> str:
    """Extract the first line from a potentially multi-line string.

    This is useful for handling commit messages that contain both a title
    (first line) and a description (subsequent lines). Only the title is
    relevant for PR title formatting.

    Args:
        text: The input string that may contain multiple lines separated by
              newline characters (\\n, \\r\\n, or \\r). Can be any string,
              including empty strings.

    Returns:
        The first line of the text, or the entire text if no newlines exist.
        If the input is empty, returns an empty string.

    Examples:
        >>> extract_first_line("Single line")
        'Single line'

        >>> extract_first_line("First line\\nSecond line\\nThird line")
        'First line'

        >>> extract_first_line("Title\\r\\nDescription")
        'Title'

        >>> extract_first_line("")
        ''

    Note:
        This function handles all common newline formats: \\n (Unix),
        \\r\\n (Windows), and \\r (old Mac).
    """
    # Split on any newline format and return the first line
    # splitlines() handles \n, \r\n, and \r automatically
    lines = text.splitlines()
    return lines[0] if lines else ""


def format_ado_link(ticket_ref: str, ticket_number: str) -> str:
    """Create a Slack-formatted link for an Azure DevOps ticket.

    Converts a ticket reference into a Slack markdown hyperlink that will be
    rendered as a clickable link in Slack messages.

    Args:
        ticket_ref: The full ticket reference including the "AB#" prefix.
                   Example: "AB#1234"
        ticket_number: The numeric portion of the ticket reference only.
                      Example: "1234"

    Returns:
        A Slack-formatted link string in the format: <URL|display_text>

    Examples:
        >>> format_ado_link("AB#1234", "1234")
        '<https://dev.azure.com/.../1234|AB#1234>'

        >>> format_ado_link("AB#9999", "9999")
        '<https://dev.azure.com/.../9999|AB#9999>'

    Note:
        The Slack link format is: <URL|display_text> where the URL is hidden
        and only the display_text is shown to users, but it remains clickable.
    """
    return f"<{ADO_BASE_URL}/{ticket_number}|{ticket_ref}>"


def format_pr_title(pr_title: str) -> str:
    """Replace Azure DevOps ticket references with Slack links.

    Scans the entire PR title for any Azure DevOps work item references matching
    the pattern "AB#<number>" and converts each occurrence into a Slack-formatted
    hyperlink. Multiple references in a single title are all converted.

    Args:
        pr_title: The original PR title containing zero or more AB# references.
                 Can be any string, including empty strings.

    Returns:
        The PR title with any AB#<number> references converted to Slack links.
        If no matches are found, returns the original title unchanged.

    Examples:
        >>> format_pr_title("AB#1234 Fix login bug")
        '<https://dev.azure.com/.../1234|AB#1234> Fix login bug'

        >>> format_pr_title("Update AB#5678 and AB#9999")
        'Update <https://dev.azure.com/.../5678|AB#5678> and <https://dev.azure.com/.../9999|AB#9999>'

        >>> format_pr_title("No ticket reference here")
        'No ticket reference here'

        >>> format_pr_title("")
        ''

    Note:
        The pattern is case-sensitive and requires "AB#" followed by one or more digits.
        Malformed references like "AB#" or "ab#1234" are not matched.
    """

    def replace_match(match: re.Match[str]) -> str:
        """Replace a single regex match with a formatted ADO link."""
        return format_ado_link(match.group(0), match.group(1))

    return ADO_TICKET_PATTERN.sub(replace_match, pr_title)


def write_github_output(key: str, value: str) -> None:
    """Write a key-value pair to the GitHub Actions output file.

    Writes output in the GitHub Actions format either to the file specified
    by the GITHUB_OUTPUT environment variable, or to stdout if not set.
    Automatically uses heredoc format for multi-line values.

    Args:
        key: The output variable name. Should be a valid GitHub Actions output key.
        value: The output variable value. Can contain any string content including
               newlines. Multi-line values are automatically written using heredoc
               format (key<<EOF...EOF) as required by GitHub Actions.

    Raises:
        OSError: If the GITHUB_OUTPUT file cannot be opened or written to.

    Examples:
        Single-line value with GITHUB_OUTPUT set:
        >>> os.environ['GITHUB_OUTPUT'] = '/tmp/output.txt'
        >>> write_github_output("pr_title", "My Title")
        # Writes "pr_title=My Title\\n" to /tmp/output.txt

        Multi-line value with GITHUB_OUTPUT set:
        >>> write_github_output("message", "Line 1\\nLine 2")
        # Writes "message<<EOF\\nLine 1\\nLine 2\\nEOF\\n" to /tmp/output.txt

        Without GITHUB_OUTPUT set:
        >>> if 'GITHUB_OUTPUT' in os.environ:
        ...     del os.environ['GITHUB_OUTPUT']
        >>> write_github_output("pr_title", "My Title")
        pr_title=My Title

    Note:
        When GITHUB_OUTPUT is set, the file is opened in append mode ('a'),
        so multiple calls will add new lines to the file without overwriting
        previous content. The heredoc delimiter 'EOF' is used for multi-line
        values to comply with GitHub Actions syntax requirements.
    """
    github_output_path = os.environ.get("GITHUB_OUTPUT")

    # Check if value contains newlines - if so, use heredoc format
    is_multiline = "\n" in value

    if github_output_path:
        output_path = Path(github_output_path)
        with output_path.open("a", encoding="utf-8") as output_file:
            if is_multiline:
                output_file.write(f"{key}<<EOF\n{value}\nEOF\n")
            else:
                output_file.write(f"{key}={value}\n")
    else:
        # If GITHUB_OUTPUT isn't set, print to stdout for local testing
        if is_multiline:
            print(f"{key}<<EOF\n{value}\nEOF")
        else:
            print(f"{key}={value}")


def unescape_quotes(text: str) -> str:
    """Remove escaped quotes from a string.

    Converts escaped quote sequences (backslash + quote) into their unescaped
    equivalents. This is useful when processing command-line arguments that
    have been shell-escaped.

    Args:
        text: The input string that may contain escaped quotes (\\\" or \\').
              Can be any string, including empty strings.

    Returns:
        The string with all escaped quotes converted to regular quotes.
        If no escaped quotes are found, returns the original string unchanged.

    Examples:
        >>> unescape_quotes('Title with \\\\"quotes\\\\"')
        'Title with "quotes"'

        >>> unescape_quotes("Title with \\\\'quotes\\\\'")
        "Title with 'quotes'"

        >>> unescape_quotes('Mixed \\\\"double\\\\" and \\\\'single\\\\'')
        'Mixed "double" and \\'single\\''

        >>> unescape_quotes("No escaped quotes")
        'No escaped quotes'

        >>> unescape_quotes("")
        ''

    Note:
        This function performs simple string replacement and does not handle
        complex escape sequences or context-aware parsing. It specifically
        handles \\\" -> " and \\' -> ' conversions.
    """
    return text.replace('\\"', '"').replace("\\'", "'")


def parse_arguments() -> argparse.Namespace:
    """Parse command-line arguments.

    Returns:
        Parsed arguments namespace containing the PR title.

    Note:
        Uses nargs='+' to accept one or more arguments, which automatically
        handles both quoted and unquoted commit messages.
    """
    parser = argparse.ArgumentParser(
        description="Convert Azure DevOps ticket references in PR titles to Slack links.",
        epilog=(
            "Examples:\n"
            '  %(prog)s "AB#1234 Fix login bug"\n'
            "  %(prog)s AB#1234 Fix login bug\n"
            '  %(prog)s "AB#5678 Fix \\"special\\" bug"'
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument(
        "pr_title",
        nargs="+",
        help=(
            "PR title containing Azure DevOps ticket references (AB#<number>). "
            "Can be passed as a single quoted string or multiple unquoted arguments."
        ),
    )

    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 1.0.0",
    )

    return parser.parse_args()


def main() -> None:
    """Entry point for the script.

    Parses command-line arguments, processes the PR title to convert any Azure
    DevOps ticket references to Slack-formatted links, and outputs the result
    either to the GitHub Actions output file or stdout.

    The function handles multiple input formats:
    - Single quoted argument: "AB#1234 Fix bug"
    - Multiple unquoted arguments: AB#1234 Fix bug
    - Arguments with escaped quotes: "Fix \\"special\\" bug"

    Exits:
        0: Success - PR title processed and output written
        2: Argument parsing error (handled by argparse)

    Environment Variables:
        GITHUB_OUTPUT: If set, output is written to this file.
                      If not set, output is printed to stdout.

    Examples:
        Standard usage:
        $ python generate_ado_link.py "AB#1234 Fix login bug"

        Unquoted arguments:
        $ python generate_ado_link.py AB#1234 Fix login bug

        With escaped quotes:
        $ python generate_ado_link.py "AB#5678 Fix \\"special\\" bug"
    """
    args = parse_arguments()

    # Join all arguments into a single string (handles unquoted multi-word titles)
    pr_title_raw = " ".join(args.pr_title)

    # Unescape any escaped quotes from shell escaping
    pr_title_unescaped = unescape_quotes(pr_title_raw)

    # Extract only the first line (title) from multi-line commit messages
    pr_title_first_line = extract_first_line(pr_title_unescaped)

    # Convert AB# references to Slack links
    formatted_title = format_pr_title(pr_title_first_line)

    # Write output to GitHub Actions or stdout
    write_github_output("pr_title", formatted_title)


if __name__ == "__main__":
    main()
