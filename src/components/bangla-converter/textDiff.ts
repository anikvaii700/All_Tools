import { DiffResult, DiffSegment } from './types';

/**
 * Word-level text comparison algorithm computing added, removed, and identical word segments.
 */
export function compareTexts(oldText: string, newText: string): DiffResult {
  const oldWords = oldText.trim().split(/\s+/).filter(Boolean);
  const newWords = newText.trim().split(/\s+/).filter(Boolean);

  if (oldWords.length === 0 && newWords.length === 0) {
    return {
      similarityPercentage: 100,
      addedWordsCount: 0,
      removedWordsCount: 0,
      unchangedWordsCount: 0,
      segments: [],
    };
  }

  // Simple Longest Common Subsequence (LCS) matrix
  const m = oldWords.length;
  const n = newWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff segments
  let i = m;
  let j = n;
  const rawSegments: DiffSegment[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      rawSegments.unshift({ type: 'same', value: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawSegments.unshift({ type: 'added', value: newWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawSegments.unshift({ type: 'removed', value: oldWords[i - 1] });
      i--;
    }
  }

  // Group adjacent segments of same type
  const segments: DiffSegment[] = [];
  for (const seg of rawSegments) {
    const last = segments[segments.length - 1];
    if (last && last.type === seg.type) {
      last.value += ' ' + seg.value;
    } else {
      segments.push({ ...seg });
    }
  }

  const unchangedWordsCount = dp[m][n];
  const removedWordsCount = m - unchangedWordsCount;
  const addedWordsCount = n - unchangedWordsCount;
  const totalRelevantWords = Math.max(m, n);
  const similarityPercentage = totalRelevantWords === 0
    ? 100
    : Math.round((unchangedWordsCount / totalRelevantWords) * 100);

  return {
    similarityPercentage,
    addedWordsCount,
    removedWordsCount,
    unchangedWordsCount,
    segments,
  };
}
