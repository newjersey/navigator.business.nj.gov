# Contributing

Thanks for considering contributing to this project! This project is built with public money for
public benefit, and that means the public (including you) can see the work, use it, and help improve
it. Whether you are a developer at another state agency, a civic technologist, or a resident who
spotted a problem, we want to hear from you.

If you are unsure about anything, ask: open an issue or pull request anyway. The worst that can
happen is we will politely ask you to change something. We treat outside contributors as
collaborators.

## Ways to contribute

You do not have to write code to contribute. All of the following are welcome:

- **Bug reports** — something is broken or behaving unexpectedly
- **Feature requests** — an idea that would make this more useful
- **Documentation improvements** — a section that is unclear, missing, or out of date
- **Accessibility feedback** — anything that makes the project harder to use
- **Code** — bug fixes, features, tests, or refactors

## Code of Conduct

This project follows our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to
uphold it. Please report unacceptable behavior to
[team@innovation.nj.gov](mailto:team@innovation.nj.gov).

## Getting help

- **Project-specific questions** — [open a GitHub Issue](../../issues/new/choose). If no template
  fits, use a blank issue.
- **Everything else** — email [team@innovation.nj.gov](mailto:team@innovation.nj.gov).

## Reporting bugs

Before filing a new bug, search [existing issues](../../issues) to see if it has already been
reported.

To file a bug, use the [bug report template](../../issues/new?template=bug.yml). Include as much
detail as you can: what you expected to happen, what actually happened, and the steps to reproduce
it.

**Do not report security vulnerabilities through public issues.** See
[Security](#security-vulnerabilities) below.

## Requesting features

Open an issue before writing any code. Describe the problem you are trying to solve, not only the
solution you have in mind, and consider what the specific criteria should be for your acceptance and
verification of a solution. The team will discuss feasibility and fit before any implementation work
begins. This saves everyone time.

## Security vulnerabilities

Please do not file a public issue for security concerns. Instead, read our
[Security Policy](SECURITY.md) and email [team@innovation.nj.gov](mailto:team@innovation.nj.gov). We
acknowledge reports within 48 hours.

## Branch naming

One branch per logical change. Keep branches short-lived.

## Commit messages

All commits must be cryptographically signed:

```sh
git commit -S -m "Your commit message"
```

Write commit messages that explain the **why**, not the what, using
[conventional commit](https://www.conventionalcommits.org/) syntax. The diff already shows what
changed. Reference the issue number when applicable:

```text
fix: race condition in session cleanup

The session store was being flushed before the response was finalized,
causing intermittent 500 errors under load. Resolves #42.
```

## Pull requests

Use the [pull request template](.github/pull_request_template.md) — it will load automatically when
you open a PR.

A few requirements before requesting review:

1. **Keep PRs small.** A pull request should be reviewable in one sitting. If your change is large,
   decompose it into a sequence of focused, independently-mergeable increments.
2. **All automated checks must pass.** Biome formatting and linting, `npm audit`, and any other CI
   checks must be green before you request a human review.
3. **Fill out the PR template.** Explain what was done and why, list the steps to test it, and note
   any accessibility considerations.

If no reviewer is assigned within a few days, email
[team@innovation.nj.gov](mailto:team@innovation.nj.gov).

## What reviewers check

Reviewers look for:

- Adherence to the [development principles](AGENTS.md)
- Behavioral correctness — does the code do what it claims?
- Completeness of error handling
- Tests that cover the changed behavior
- Absence of security concerns

Reviewers do **not** check for formatting or style issues — those are enforced automatically by CI.
Human review time is for things machines cannot catch.

Every review comment will be actionable: a specific alternative, a concrete problem, or a clarifying
question.

## Code style

Biome is enforced automatically on every commit and in CI. It handles both formatting and linting,
so you do not need to think about code style.

For architectural and language conventions — module structure, type system usage, async patterns,
error handling, logging, and more — see [`AGENTS.md`](AGENTS.md), the development constitution for
this project.

## License

This project is licensed under the [MIT License](LICENSE). By contributing, you agree that your work
will be released under the same license.
