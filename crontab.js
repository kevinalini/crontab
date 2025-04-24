#!/usr/bin/env node

const input = process.argv[2];
if (!input) {
  console.log(
    'Usage: node crontab.js "<cron string>"\nOr make it executable:\nchmod +x crontab.js\n./crontab.js "<cron string>"'
  );
  process.exit(1);
}

const parts = input.split(" ");
if (parts.length < 6) {
  console.log("Invalid arguments.");
  process.exit(1);
}

const DAYS = {
  mon: 1,
  tus: 2,
  wen: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
};

const [minuteStr, hourStr, domStr, monthStr, dowStr, ...cmdParts] = parts;
const command = cmdParts.join(" ");

const expand = (value, min, max) => {
  const returnArr = [];

  // 1,2,4-7,10-20/2
  //   console.log(value.split(","));
  // Split by commas (e.g. "1,2,5-10/2")
  const partsOfValue = value.split(",");

  partsOfValue.forEach((part) => {
    // 1. Step with wildcard: */n
    // e.g. "*/15" -> every 15 units starting from min
    if (part.startsWith("*/")) {
      const step = Number(part.split("/")[1]);
      if (step > max + 1 || step < min) {
        returnArr.push("invalid number");
        return;
      }
      for (let value = min; value <= max; value += step) {
        returnArr.push(value);
      }
    }

    // 2. Step with range: a-b/n
    // e.g. "10-20/5" -> 10, 15, 20
    else if (part.includes("-") && part.includes("/")) {
      const [rangePart, stepPart] = part.split("/");
      const [start, end] = rangePart.split("-");
      if (
        start < min ||
        start > end ||
        start > max + 1 ||
        end < min ||
        end > max + 1 ||
        stepPart < min ||
        stepPart > max + 1
      ) {
        returnArr.push("invalid number");
        return;
      }

      for (
        let value = Number(start);
        value <= Number(end);
        value += Number(stepPart)
      ) {
        returnArr.push(value);
      }
    }

    // 3. Everything: "*"
    // e.g. "*" -> all values from min to max
    else if (part === "*") {
      for (let value = min; value <= max; value++) {
        returnArr.push(value);
      }
    }

    // 4. Range only: a-b
    // e.g. "5-10" -> 5,6,7,8,9,10
    else if (part.includes("-")) {
      const [start, end] = part.split("-");
      if (
        start < min ||
        start > end ||
        start > max + 1 ||
        end < min ||
        end > max + 1
      ) {
        returnArr.push("invalid number");
        return;
      }

      for (let value = Number(start); value <= Number(end); value++) {
        returnArr.push(value);
      }
    }

    // 5. Single value: just a number like "15"
    else {
      if (Number(part) < min || Number(part) > max + 1) {
        returnArr.push("invalid number");
        return;
      }
      returnArr.push(Number(part));
    }
  });

  // remove any possible duplicates
  const result = [...new Set(returnArr)].sort((a, b) => a - b);

  return result;
};

/**
 * XX XX XX XX XX /usr/bin/find
 * Position	   Name	     min-value	max-value
 * 1           minute        0         59
 * 2           hour          0         23
 * 3           day of M      1         31
 * 4           month         1         12
 * 5           day of W      0          6
 * 6           command    /usr/bin/find
 */

// Separate parsing functions
function parseMinute(val) {
  return expand(val, 0, 59);
}

function parseHour(val) {
  return expand(val, 0, 23);
}

function parseDayOfMonth(val) {
  return expand(val, 1, 31);
}

function parseMonth(val) {
  return expand(val, 1, 12);
}

function parseDayOfWeek(val) {
  return expand(val, 0, 6);
}

const ImportDays = () => {
  let returnModStr = dowStr;

  returnModStr = returnModStr.replace(/mon/g, 1);
  returnModStr = returnModStr.replace(/tus/g, 2);
  returnModStr = returnModStr.replace(/wen/g, 3);
  returnModStr = returnModStr.replace(/thu/g, 4);
  returnModStr = returnModStr.replace(/fri/g, 5);
  returnModStr = returnModStr.replace(/sat/g, 6);
  returnModStr = returnModStr.replace(/sun/g, 0);

  return returnModStr;
};

// Print table
console.log("minute".padEnd(14), parseMinute(minuteStr).join(" "));
console.log("hour".padEnd(14), parseHour(hourStr).join(" "));
console.log("day of month".padEnd(14), parseDayOfMonth(domStr).join(" "));
console.log("month".padEnd(14), parseMonth(monthStr).join(" "));
console.log("day of week".padEnd(14), parseDayOfWeek(ImportDays()).join(" "));
console.log("command".padEnd(14), command);
