# LogiQlink Playwright Release Gate

A minimal Vite and TypeScript support dashboard lets an agent open a synthetic ticket, generate a summary, and approve it or retry after a service failure. Playwright exercises the browser workflow in Chromium and runs deterministic checks on synthetic summaries. The project requires no credentials, paid services, or external AI calls.

## Setup and Local Checks

Use Node.js 24 LTS and npm from the repository root.

```sh
npm ci
npx playwright install chromium
npm run typecheck
npm test
npm test -- --workers=2
```

Run `npm run dev` to open the dashboard manually at the URL Vite prints. Run `npm run test:ui` for Playwright's interactive runner or `npm run test:headed` to see Chromium during browser tests.

## Playwright Configuration

Copy `.env.example` to `.env` to set local overrides. Variables already set in the shell take precedence.

| Variable | Behavior |
| --- | --- |
| `PW_PORT` | Vite port for Playwright-managed runs. Defaults to 4173. |
| `PW_BASE_URL` | Base URL of an already running dashboard. Setting it skips Playwright-managed Vite startup. |
| `PW_SLOW_MO` | Optional delay between browser actions in milliseconds. |
| `PW_USER_AGENT` | Optional Chromium user agent override. |

CI rejects focused tests and runs Chromium with one worker and up to two retries per test. A test that passes on retry is reported as flaky and can still pass the CI job. Local runs use Playwright's default worker count and zero retries. Use CLI flags such as `--workers=2` or `--retries=1` to override these settings for a run.

## Validation Architecture and Release-Blocking Criteria

- **Dashboard at runtime.** Approval requires at least one citation, and every cited message ID must belong to the current ticket. Missing citations and citations from another ticket keep approval disabled, including when valid and invalid citations appear together. The dashboard does not currently enforce critical-fact consistency at runtime.
- **Service boundary and UI tests.** Vite serves `app/public/api/summary.json` at `GET /api/summary.json` for manual use, the unmocked smoke test, and the API test. The other browser tests intercept the same endpoint with `page.route()` and use the dashboard and ticket page objects to exercise the UI. Each test has an isolated page and its own response queue.
- **Deterministic evaluation in the test suite.** The evaluator reuses the dashboard's citation rule and checks recognized USD refund amounts and order statuses against structured facts in the cited synthetic messages. Each recognized claim needs support from at least one cited message. These tests call the pure TypeScript evaluator without opening a browser page.
- **CI release criteria.** The [GitHub Actions workflow](.github/workflows/playwright.yml) runs on pushes and pull requests. Type checking, the UI and API suites, and the deterministic evaluation suite must pass. A failure in any required step fails the job. Require the **Release gate checks** status in the target branch's protection rule or ruleset to enforce the gate before merging.

## Project Layout

- `app/` is the Vite root and contains the dashboard entry point, source, and public summary fixture.
- `pages/ui/` contains the browser page objects. `api/` contains the Playwright summary endpoint client.
- `tests/ui/`, `tests/api/`, and `tests/evaluation/` contain browser, service, and deterministic evaluator checks.
- `fixtures/` wires up page objects, test data, and summary response mocks.
- `test-data/` contains synthetic ticket inputs.
- `config/` contains local server settings consumed by the root Playwright configuration.

## Test Scenarios

| Tests | Coverage |
| --- | --- |
| 1 unmocked browser test | Opens a ticket, displays the local summary, and approves it. |
| 6 mocked browser tests | Valid approval, insufficient information, 503 with retry available, successful retry, missing citations, and mixed current-ticket and cross-ticket citations. |
| 1 API test | Checks the local summary response and its citation. |
| 11 deterministic evaluation tests | Valid, missing, empty, cross-ticket, and mixed citations. Supported and unsupported refund and order-status claims, including a refund supported only by an uncited message. |

## CI Evidence

Download the **playwright-evidence** artifact from the workflow run. The upload step runs even after a failed test and retains available evidence for 14 days. If setup or type checking fails before Playwright starts, inspect the workflow step logs.

- `playwright-report/index.html` is the HTML report. After extracting the artifact, run `npx playwright show-report playwright-report` from the directory containing the report.
- `test-results/junit.xml` contains the test results in JUnit format.
- Failing browser tests retain a trace, screenshot, and video under `test-results/`. Open an individual trace with `npx playwright show-trace path/to/trace.zip`.

## Reproduce the Citation Regression

Run the following from the repository root in PowerShell. The temporary change accepts any nonempty citation list, including the mixed list in the cross-ticket test. The script restores the original file even when the test fails.

```powershell
$dashboard = (Resolve-Path -LiteralPath app/src/dashboard.ts).Path
$original = [IO.File]::ReadAllBytes($dashboard)
$source = [Text.Encoding]::UTF8.GetString($original)
$before = 'const citationsValid = hasValidCitations(result.sourceIds, messages);'
$after = 'const citationsValid = Array.isArray(result.sourceIds) && result.sourceIds.length > 0;'
if (!$source.Contains($before)) { throw 'Expected citation check is missing.' }

try {
  [IO.File]::WriteAllText($dashboard, $source.Replace($before, $after))
  npm test -- tests/ui/ticket.spec.ts -g "blocks approval when a citation belongs to another ticket"
  $regressionExit = $LASTEXITCODE
} finally {
  [IO.File]::WriteAllBytes($dashboard, $original)
}

if ($regressionExit -ne 1) { throw "Expected exit 1, got $regressionExit." }
```

Expect one failure at the status assertion. The test expects `Summary citations are missing or invalid.` and the regressed dashboard shows `Summary ready for approval.` Inspect or copy the failure evidence before running the full suite again, because Playwright replaces its output directories. After restoration, run `npm run typecheck` and `npm test`. All 19 tests should pass.

## Limitations and Future Improvements

The evaluator recognizes a limited set of affirmative phrases. It can miss unfamiliar paraphrases, negations, other currencies or formats, and omitted facts. Matching a cited fact also leaves conflicting or outdated evidence unresolved.

Future work could expand the supported fact types and formats and add rules for conflicting or superseded facts. A separate live-model evaluation should use representative tickets and human review to measure factual support, citation relevance, coverage of critical facts, abstention when evidence is insufficient, and variation across repeated generations. See [Deterministic summary evaluation](EVALUATION.md) for details.

## AI-Assisted Development

Codex assisted with the dashboard, test fixtures, evaluator, workflow, and documentation. The local implementation was verified with a clean dependency install, TypeScript checks, the full suite, and an intentional regression that failed for the expected reason before the original behavior was restored.
