Exercise: Build a Playwright release gate for an AI-assisted feature
A support dashboard lets an agent open a ticket and click Generate summary. The agent can approve a valid summary or retry a failed generation.

Use a minimal local fixture or mocked service boundary to represent the feature. A local run should work with synthetic data and require no credentials, paid services, or external AI calls.

Service response	Expected dashboard behavior
200 with { "status": "ok", "summary": "...", "sourceIds": ["m1"] }	Display the summary and enable approval if its citations are valid.
200 with { "status": "insufficient_information" }	Display an insufficient-information state and keep approval disabled.
503 with { "error": "unavailable" }	Show an error and offer a retry. Keep approval disabled until a successful retry returns a valid summary.
A valid summary cites at least one message from the current ticket, and every cited message ID must belong to that ticket. A summary with missing or cross-ticket citations must remain ineligible for approval. Summary wording can vary.

What to build
A Playwright and TypeScript test suite covering successful generation, error and recovery, and an invalid summary that must block approval. Use reusable fixtures, make the tests safe to run in parallel, and show where you draw the line between UI and service or evaluation checks.

A small, deterministic summary evaluation with synthetic examples of acceptable and unacceptable output. Check source attribution and one additional risk you consider important. Explain what these checks establish and what you would test separately against a live model.

A CI workflow using GitHub Actions or an equivalent. Make it clear which failures block a release and retain enough failure evidence for another engineer to investigate. Document how to introduce one intentional regression and observe the suite fail.

Include a short README with setup instructions, commands for the passing run and the intentional failure, your release-blocking criteria, and what you would add next. You’re welcome to use AI coding tools. If you do, briefly explain how you used them and how you verified their output. If you reach the time limit, submit what you have and explain what you’d do next.