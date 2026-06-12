import { Result, ok, err } from './types';

// ---------------------------------------------------------------------------
// Cron Expression Parser / Explainer
// ---------------------------------------------------------------------------

export interface CronExplanation {
  minute: FieldExplanation;
  hour: FieldExplanation;
  dayOfMonth: FieldExplanation;
  month: FieldExplanation;
  dayOfWeek: FieldExplanation;
  humanReadable: string;
  nextRuns: string[];
}

export interface FieldExplanation {
  raw: string;
  meaning: string;
}

const WEEKDAYS: Record<string, string> = {
  '0': 'Sunday',
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
  '7': 'Sunday',
};

const MONTHS: Record<string, string> = {
  '1': 'January',
  '2': 'February',
  '3': 'March',
  '4': 'April',
  '5': 'May',
  '6': 'June',
  '7': 'July',
  '8': 'August',
  '9': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
};

function explainField(field: string, type: 'minute' | 'hour' | 'day' | 'month' | 'weekday'): string {
  if (field === '*') {
    switch (type) {
      case 'minute': return 'Every minute';
      case 'hour': return 'Every hour';
      case 'day': return 'Every day of the month';
      case 'month': return 'Every month';
      case 'weekday': return 'Every day of the week';
    }
  }
  if (field.includes(',')) {
    const parts = field.split(',');
    const vals = parts.map((p) => formatFieldValue(p.trim(), type));
    return `At ${vals.join(', ')}`;
  }
  if (field.includes('-')) {
    const [start, end] = field.split('-');
    const s = formatFieldValue(start.trim(), type);
    const e = formatFieldValue(end.trim(), type);
    return `From ${s} to ${e}`;
  }
  if (field.startsWith('*/')) {
    const n = field.slice(2);
    switch (type) {
      case 'minute': return `Every ${n} minutes`;
      case 'hour': return `Every ${n} hours`;
      case 'day': return `Every ${n} days`;
      case 'month': return `Every ${n} months`;
      case 'weekday': return `Every ${n} days of the week`;
    }
  }
  return `At ${formatFieldValue(field, type)}`;
}

function formatFieldValue(val: string, type: 'minute' | 'hour' | 'day' | 'month' | 'weekday'): string {
  if (type === 'month' && MONTHS[val]) return MONTHS[val];
  if (type === 'weekday' && WEEKDAYS[val]) return WEEKDAYS[val];
  if (type === 'hour') return `${val.padStart(2, '0')}:00`;
  return val;
}

function describeHumanReadable(fields: string[]): string {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;

  // Special common patterns
  if (minute === '0' && hour === '0' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every day at midnight';
  }
  if (minute === '0' && hour === '0' && dayOfMonth === '1' && month === '*' && dayOfWeek === '*') {
    return 'On the first day of every month at midnight';
  }
  if (minute === '0' && hour === '9' && dayOfMonth === '*' && month === '*' && dayOfWeek === '1') {
    return 'Every Monday at 9:00 AM';
  }
  if (minute === '*') {
    // every minute
    return 'Every minute';
  }
  if (minute.startsWith('*/') && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Every ${minute.slice(2)} minutes`;
  }
  if (minute === '0' && hour.startsWith('*/') && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return `Every ${hour.slice(2)} hours`;
  }

  const parts: string[] = [];

  // Describe minute
  if (minute === '*') {
    // nothing, handled by hour-specific
  } else if (minute.startsWith('*/')) {
    parts.push(`every ${minute.slice(2)} minutes`);
  } else {
    parts.push(`at minute ${minute}`);
  }

  // Describe hour
  if (hour === '*') {
    if (minute !== '*' && !minute.startsWith('*/')) {
      parts.push('of every hour');
    }
  } else if (hour.startsWith('*/')) {
    parts.push(`every ${hour.slice(2)} hours`);
  } else {
    parts.push(`past ${formatFieldValue(hour, 'hour')}`);
  }

  // Describe day of month
  if (dayOfMonth !== '*') {
    if (dayOfMonth.startsWith('*/')) {
      parts.push(`every ${dayOfMonth.slice(2)} days`);
    } else {
      parts.push(`on day ${dayOfMonth}`);
    }
  }

  // Describe month
  if (month !== '*') {
    if (month.startsWith('*/')) {
      parts.push(`every ${month.slice(2)} months`);
    } else {
      parts.push(`in ${formatFieldValue(month, 'month')}`);
    }
  }

  // Describe day of week
  if (dayOfWeek !== '*') {
    if (dayOfWeek.startsWith('*/')) {
      parts.push(`every ${dayOfWeek.slice(2)} days of the week`);
    } else {
      const days = dayOfWeek.split(',').map((d) => WEEKDAYS[d.trim()] || `day ${d}`).join(', ');
      parts.push(`on ${days}`);
    }
  }

  if (parts.length === 0) return 'Every minute of every hour of every day';

  // Capitalize first letter
  const result = parts.join(' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function getNextRuns(expression: string, count: number = 5): string[] {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== 5) return [];

  const now = new Date();
  const runs: string[] = [];
  let candidate = new Date(now);
  candidate.setSeconds(0, 0);

  // Move to the start of the next minute
  candidate.setMinutes(candidate.getMinutes() + 1, 0, 0);

  let iterations = 0;
  const maxIterations = 525600; // 1 year of minutes

  while (runs.length < count && iterations < maxIterations) {
    iterations++;
    if (matchesCron(candidate, fields)) {
      runs.push(candidate.toISOString().replace('T', ' ').slice(0, 16));
      candidate.setMinutes(candidate.getMinutes() + 1);
    } else {
      candidate.setMinutes(candidate.getMinutes() + 1);
    }
  }

  return runs;
}

function matchesCron(date: Date, fields: string[]): boolean {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1; // 1-based
  const dayOfWeek = date.getDay(); // 0=Sun

  return (
    matchesField(minute.toString(), fields[0]) &&
    matchesField(hour.toString(), fields[1]) &&
    matchesField(dayOfMonth.toString(), fields[2]) &&
    matchesField(month.toString(), fields[3]) &&
    matchesField(dayOfWeek.toString(), fields[4])
  );
}

function matchesField(value: string, pattern: string): boolean {
  if (pattern === '*') return true;

  // Handle comma-separated list
  if (pattern.includes(',')) {
    return pattern.split(',').some((p) => matchesField(value, p.trim()));
  }

  // Handle range
  if (pattern.includes('-')) {
    const [start, end] = pattern.split('-').map(Number);
    const v = Number(value);
    return v >= start && v <= end;
  }

  // Handle step (e.g., */15)
  if (pattern.startsWith('*/')) {
    const step = parseInt(pattern.slice(2), 10);
    if (isNaN(step) || step === 0) return false;
    return parseInt(value, 10) % step === 0;
  }

  // Exact match
  return value === pattern;
}

/**
 * Parse a standard 5-field cron expression and return a detailed explanation.
 */
export function explainCron(expression: string): Result<CronExplanation> {
  try {
    const trimmed = expression.trim();
    if (!trimmed) {
      return err('Please enter a cron expression.');
    }

    const fields = trimmed.split(/\s+/);
    if (fields.length !== 5) {
      return err(
        `Invalid cron expression: expected 5 fields (minute hour day month weekday), got ${fields.length}.`
      );
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;

    // Basic validation
    const validators: [string, string, number, number][] = [
      [minute, 'minute', 0, 59],
      [hour, 'hour', 0, 23],
      [dayOfMonth, 'day of month', 1, 31],
      [month, 'month', 1, 12],
      [dayOfWeek, 'day of week', 0, 7],
    ];

    for (const [field, name, min, max] of validators) {
      if (field !== '*' && !field.startsWith('*/')) {
        const nums = field.split(',').flatMap((p) =>
          p.includes('-')
            ? (() => {
                const parts = p.split('-').map(Number);
                return parts.filter((n) => !isNaN(n));
              })()
            : [Number(p)]
        );
        for (const n of nums) {
          if (isNaN(n) || n < min || n > max) {
            return err(`Invalid ${name} value "${field}": must be between ${min} and ${max}.`);
          }
        }
      } else if (field.startsWith('*/')) {
        const step = parseInt(field.slice(2), 10);
        if (isNaN(step) || step < 1) {
          return err(`Invalid step value in "${field}": must be a positive number.`);
        }
      }
    }

    const explanation: CronExplanation = {
      minute: { raw: minute, meaning: explainField(minute, 'minute') },
      hour: { raw: hour, meaning: explainField(hour, 'hour') },
      dayOfMonth: { raw: dayOfMonth, meaning: explainField(dayOfMonth, 'day') },
      month: { raw: month, meaning: explainField(month, 'month') },
      dayOfWeek: { raw: dayOfWeek, meaning: explainField(dayOfWeek, 'weekday') },
      humanReadable: describeHumanReadable(fields),
      nextRuns: getNextRuns(trimmed, 5),
    };

    return ok(explanation);
  } catch (e: any) {
    return err(`Cron parse error: ${e.message}`);
  }
}
