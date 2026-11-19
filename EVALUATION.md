# Deterministic summary evaluation

Run the complete release-gate suite with `npm test` or only the evaluator cases with `npm test -- tests/evaluation.spec.ts`. The evaluator tests use Playwright's test runner and assertions without opening a browser page.

The shared citation validator requires at least one cited ID and checks every ID against the current ticket. The dashboard uses this rule for approval. Separately, the evaluator checks that each recognized critical claim has a matching structured fact in at least one cited message. It reports invalid citations, unsupported refund amounts, and unsupported order statuses.

The refund matcher recognizes simple USD forms such as “refund of $25.50” and “refund amount: $25.5”. The order matcher recognizes a fixed vocabulary in forms such as “the order has been delivered” and “order status: in transit”. These rules handle a limited set of affirmative phrases. A passing result can miss claims written as paraphrases, negations, hypothetical statements, other currencies or number formats, and claims about facts outside the supported vocabulary. It also leaves completeness, citation relevance for other statements, and conflicting or superseded source facts unevaluated.

A separate live-model evaluation should use representative tickets and human-reviewed examples to measure factual support, citation relevance, correct handling of conflicting or outdated messages, coverage of critical facts, and appropriate abstention when evidence is insufficient. Repeat generation to measure variability. This repository uses synthetic data and makes no model calls.

Any failing evaluation test blocks release because it means the evaluator disagreed with a known expected outcome. An intentionally invalid example passes its test when the evaluator rejects it. The GitHub Actions release-gate job runs these tests alongside the UI suite and fails if either suite reports a failure.
