/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const fs = require("fs");

const outPath = `${process.cwd()}/lib/static/records/naics2022.json`;
const inPath = `${process.cwd()}/lib/static/records/6digit.csv`;

const saveRecords = async () => {
  const records = airtableSelectAll();
  const json = JSON.stringify(records);
  fs.writeFile(outPath, json, (err) => {
    if (err) {
      throw err;
    }
  });
};

const DigitRangeToArray = (value) => {
  if (!value) {
    return [];
  }
  if (Number.isInteger(value)) {
    return [value];
  }
  if (!value.includes("-")) {
    return [Number.parseInt(value)];
  }
  const values = value.split("-").map((value) => {
    return Number.parseInt(value);
  });
  if (values.length !== 2) {
    return;
  }
  return Array.from({ length: values[1] + 1 - values[0] }, (v, k) => {
    return k + values[0];
  });
};

const sixDigitRenameCodes = [
  { name: "SixDigitDescription", fieldName: "6 digit description" },
  { name: "SixDigitCode", fieldName: "6 digit code" },
  { name: "FourDigitDescription", fieldName: "4 digit description" },
  { name: "FourDigitCode", fieldName: "4 digit code (from 4 digit description)" },
  { name: "TwoDigitDescription", fieldName: "2 digit (from 4 digit description)" },
  { name: "TwoDigitCode", fieldName: "2 digit code (from 4 digit description)", convert: DigitRangeToArray },
  {
    name: "industryIds",
    fieldName: "BFS Industries",
    convert: (value) => {
      return value?.split(",") ?? undefined;
    }
  }
];

const airtableSelectAll = () => {
  const csv = fs.readFileSync(inPath).toString().split('"""').join('"');
  const records = csvToJson(csv);

  return records.map((record) => {
    return sixDigitRenameCodes.reduce((acc, curr) => {
      if ("convert" in curr) {
        acc[curr.name] = curr.convert(record[curr.fieldName]);
      } else {
        acc[curr.name] = record[curr.fieldName];
      }
      return acc;
    }, {});
  });
};

/**
 * Takes a raw CSV string and converts it to a JavaScript object.
 * @param {string} text The raw CSV string.
 * @param {string[]} headers An optional array of headers to use. If none are
 * given, they are pulled from the first line of `text`.
 * @param {string} quoteChar A character to use as the encapsulating character.
 * @param {string} delimiter A character to use between columns.
 * @returns {object[]} An array of JavaScript objects containing headers as keys
 * and row entries as values.
 */
function csvToJson(text, headers, quoteChar = '"', delimiter = ",") {
  const regex = new RegExp(`\\s*(${quoteChar})?(.*?)\\1\\s*(?:${delimiter}|$)`, "gs");

  const match = (line) => {
    const matches = [...line.matchAll(regex)].map((m) => {
      return m[2];
    });
    matches.pop(); // cut off blank match at the end
    return matches;
  };

  const lines = text.split("\n");
  const heads = headers ?? match(lines.shift());

  return lines.map((line) => {
    return match(line).reduce((acc, cur, i) => {
      // Attempt to parse as a number; replace blank matches with `null`
      const val = cur.length <= 0 ? null : Number(cur) || cur;
      const key = heads[i] ?? `extra_${i}`;
      return { ...acc, [key]: val };
    }, {});
  });
}

saveRecords();
