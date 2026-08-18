import * as fs from 'node:fs';

/**
 * Computes overall line coverage percentage from an lcov.info file.
 *
 * Sums all `LF:` (lines found) and `LH:` (lines hit) records across
 * every source file section in the lcov.info, then returns the ratio
 * as a percentage truncated to two decimal places.
 *
 * @throws Error if the file cannot be read or contains no LF records
 */
export function computeCoverage(filename: string): number {
  const content = fs.readFileSync(filename, 'utf-8');
  let totalLines = 0;
  let coveredLines = 0;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('LF:')) {
      totalLines += Number(trimmed.slice(3));
    } else if (trimmed.startsWith('LH:')) {
      coveredLines += Number(trimmed.slice(3));
    }
  }

  if (totalLines === 0) {
    throw new Error(`no LF records found in ${filename}`);
  }

  return Math.trunc((coveredLines / totalLines) * 10000) / 100;
}
