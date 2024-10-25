#!/usr/bin/env python

import os
import sys
import re
import yaml
import csv

# List of written-out number words
number_words = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
    "hundred",
    "thousand",
    "million",
    "billion",
]


def extract_title(front_matter: str) -> str:
    """
    Extract the title from the YAML front matter of a markdown file.

    :param front_matter: The YAML front matter as a string.
    :return: The title as a string.
    """
    data = yaml.safe_load(front_matter)
    return data.get("name", data.get("header", "No Title"))


def search_numbers_in_file(file_path: str, csv_writer: csv.writer) -> None:
    """
    Search for numeric words and written-out number words in a markdown file and write the file path, title, and the line to CSV.

    :param file_path: The path to the markdown file.
    :param csv_writer: The CSV writer object.
    """
    with open(file_path, "r") as file:
        content = file.read()
        if content.startswith("---"):
            front_matter, body = content.split("---", 2)[1:3]
        else:
            front_matter, body = content.split("---", 1)
        title = extract_title(front_matter)
        for line in body.splitlines():
            if re.search(r"\b\d+\b", line) or re.search(
                r"\b(?:" + "|".join(number_words) + r")\b", line, re.IGNORECASE
            ):
                csv_writer.writerow([file_path, title, line])


def search_numbers_in_directory(directory: str) -> None:
    """
    Recursively search for numeric words and written-out number words in markdown files within a directory and output the results in CSV format.

    :param directory: The root directory to search.
    """
    with open("output.csv", "w", newline="", encoding="utf-8") as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(["File Path", "Title", "Line Contents"])
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(".md"):
                    search_numbers_in_file(os.path.join(root, file), csv_writer)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python search_numbers_in_markdown.py <directory>")
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Error: {directory} is not a valid directory.")
        sys.exit(1)

    search_numbers_in_directory(directory)
