# Cron Expression Parser

This is a small CLI tool that parses a cron string and prints out the expanded values for each field in a nice table.

It supports the standard 5-field cron format:

```bash
minute hour day-of-month month day-of-week command
```

---

### What it supports

- `*` (every value)
- `*/n` (step values)
- `a-b` (ranges)
- `a-b/n` (range with step)
- `a,b,c` (comma-separated list)

---

### Field Ranges

| Field        | Range   |
| ------------ | ------- |
| minute       | 0–59    |
| hour         | 0–23    |
| day of month | 1–31    |
| month        | 1–12    |
| day of week  | sun-mon |

_(0 is Sunday, like in cron)_

---

### How to run

You can run it like this:

```bash
node crontab.js "*/15 0 1,15 * mon-fri /usr/bin/find"
```

Or make it executable and run directly:

```bash
chmod +x crontab.js
./crontab.js "*/15 0 1,15 * mon-fri /usr/bin/find"
```

**Example output**

```bash
minute        0 15 30 45
hour          0
day of month  1 15
month         1 2 3 4 5 6 7 8 9 10 11 12
day of week   1 2 3 4 5
command       /usr/bin/find

```

## Reference

I used https://man7.org/linux/man-pages/man5/crontab.5.html to double-check how cron fields work.
