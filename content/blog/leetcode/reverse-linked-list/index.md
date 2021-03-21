---
title: Reverse Linked List
date: 2021-02-11T15:49:03.284Z
url: https://leetcode-cn.com/problems/reverse-linked-list
english: true
---
import LeetCode from "components/LeetCode"

<LeetCode.ProblemCard id={206} />

Given the head of a singly linked list, reverse the list, and return the reversed list.

```
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
```

## Recursive Method

```java
public ListNode reverse(ListNode node) {
  if (node == null || node.next == null) {
    return node;
  }
  ListNode newHead = reverse(head.next); // highlight-line
  node.next.next = head;
  node.next = null;
  return newHead;
}
```

Recursive call trace:
```shell
┌ reverse (1) -> 2 -> 3 -> 4 -> 5
│ ┌ reverse 1 -> (2) -> 3 -> 4 -> 5
│ │ ┌ reverse 1 -> 2 -> (3) -> 4 -> 5
│ │ │ ┌ reverse 1 -> 2 -> 3 -> (4) -> 5
│ │ │ │  reverse 1 -> 2 -> 3 -> 4 -> (5) // highlight-line
│ │ │ └ reverse 1 -> 2 -> 3 -> (4) <~ 5
│ │ └ reverse 1 -> 2 -> (3) <~ 4 <~ 5
│ └ reverse 1 -> (2) <~ 3 <~ 4 <~ 5
└ reverse (1) <~ 2 <~ 3 <~ 4 <~ 5
```

Note in this example:
- `newHead` is always $5$.
