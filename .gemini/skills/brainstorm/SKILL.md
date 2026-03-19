---
name: gk-brainstorm
description: Software solution brainstorming, architectural evaluation, and technical decision debating. Use when users need to explore design patterns, compare architectural approaches, or weigh pros and cons of technical implementations before coding.
---

# Brainstorm

## Overview

This skill helps Gemini CLI assist users in exploring software solutions, evaluating architectural choices, and debating technical decisions. It's designed to provide a structured approach to problem-solving and decision-making before the implementation phase.

## Workflow Decision Tree

1. **Does the user have a problem and needs potential solutions?**
   - Use **Task 1: Solution Brainstorming**.
2. **Does the user have specific architectural options to compare?**
   - Use **Task 2: Architectural Evaluation**.
3. **Does the user need to finalize a technical decision or ADR?**
   - Use **Task 3: Technical Decision Debating**.

---

## Task 1: Solution Brainstorming

When the user presents a problem without a clear solution:
- **Understand the constraints**: Identify budget, time, scale, and technical stack.
- **Generate multiple options**: Provide 3-5 diverse approaches (e.g., MVP, scalable, cutting-edge).
- **Propose trade-offs**: Briefly mention the pros and cons of each.
- **Consult Patterns**: Reference `references/patterns.md` for inspiration.

## Task 2: Architectural Evaluation

When comparing specific options (e.g., Microservices vs Monolith):
- **Define Evaluation Criteria**: Reference `references/evaluation-criteria.md`.
- **Score the options**: Use a matrix or qualitative comparison based on the criteria.
- **Highlight "Critical Failures"**: Identify if any option fails a mandatory requirement (e.g., security, latency).

## Task 3: Technical Decision Debating

When the user wants to "debate" or "finalize" a choice:
- **Steel-man the options**: Present the strongest possible case for the option the user *isn't* favoring yet.
- **Devil's Advocate**: Point out potential pitfalls, hidden maintenance costs, or technical debt.
- **Formulate an ADR**: Help the user draft an Architecture Decision Record (ADR) based on the consensus.

---

## Resources

### references/patterns.md
Common design patterns and architectural styles to inspire solutions.

### references/evaluation-criteria.md
A framework for evaluating technical decisions (trade-offs, scalability, cost, maintenance).
