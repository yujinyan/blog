---
title: 300. Longest Increasing Subsequence
date: 2021-02-11T15:49:03.284Z
url: https://leetcode-cn.com/problems/longest-increasing-subsequence/
english: true
---

https://leetcode-cn.com/problems/longest-increasing-subsequence/

## Key Intuition

To build the recurrence relation, we could ask ourselves whether the answer for $n - 1$ elements help us solve the entire sequence.

Suppose we know the longest increasing sequence in $(S_0, S_1, ..., S_{n-1})$ was of length $5$, and that $S_n = 8$. Will the longest increasing subsequence of $S$ be $5$ or $6$? It depends on whether the length-$5$ sequence ends with a value less than $8$.

Therefore, we really need to check every number $(S_0, S_1,...S_j)$ where $j < n - 1$ and see whether $S_n > S_j$.

## Code

```java
public int lengthOfLIS(int[] nums) {
  int result = 1;
  int dp[] = new int[nums.length];
  Arrays.fill(dp, 1);

  for (int i = 1; i < nums.length; i++) {
    for (int j = 0; j < i; j++) {
      if (nums[i] > nums[j]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    result = Math.max(dp[i], result);
  }

  return result;
}
```

## Best Explanation

- [相同的思路：从最长递增子序列谈起](https://leetcode-cn.com/problems/palindrome-partitioning-ii/solution/xiang-tong-de-si-lu-cong-zui-chang-di-ze-9kfm/)
- <cite>The Algorithm Design Manual §10.3</cite>