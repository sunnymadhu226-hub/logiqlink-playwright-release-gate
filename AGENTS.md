# Codex Project Instructions

## Project
LogiQlink Principal Quality Engineering – Playwright Release Gate

## Technology
- Playwright with TypeScript
- Minimal local application using Vite
- Playwright API mocking with `page.route()`
- Page Object Model and reusable fixtures
- GitHub Actions CI

## Implementation Rules
1. Read `REQUIREMENTS.md` before making changes.
2. Implement the project incrementally.
3. Use clean, maintainable TypeScript.
4. Make all tests independent and parallel-safe.
5. Use accessible locators and Playwright web-first assertions.
6. Avoid hardcoded waits.
7. Validate citations against the current ticket before enabling approval.
8. Add deterministic evaluation checks for citation validity and unsupported critical facts.
9. Do not use external AI APIs, credentials, or paid services.
10. Capture failure evidence using traces, screenshots, videos, and reports.
11. Document intentional regression testing.
12. Do not suppress or bypass failing tests.

## Execution
- Explain the implementation plan before writing code.
- Implement one milestone at a time.
- Run TypeScript checks and relevant tests after each milestone.
- Fix errors and report the actual test results.
- Do not claim tests passed unless they were executed successfully.
- Keep the solution appropriate for a three-hour assessment.
