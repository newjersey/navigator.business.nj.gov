# React 19 upgrade docs

This folder contains docs created during the React 19 upgrade PR work.

## Documents

- **PR review (audit + punchlist):** `docs/react-19/pr-review-react-19-upgrade.md`
- **Diataxis (Explanation):** `docs/react-19/react-19-patterns-explanation.md`

## Source PR

- GitHub PR: `#12395` (branch `react-19`, single commit `a74fa46cfe`)

## Maintaining these docs

These docs are meant to stay aligned to the PR discussion and the actual code changes. Prefer updating them by re-pulling source inputs rather than relying on memory.

### Refresh PR discussion inputs

```bash
gh pr view 12395 --json updatedAt,comments,reviews > /tmp/react19_pr_conversation.json
```

If you need inline review threads, use GraphQL and paginate:

```bash
gh api graphql -f query='
query($owner:String!, $name:String!, $number:Int!, $after:String) {
  repository(owner:$owner, name:$name) {
    pullRequest(number:$number) {
      reviewThreads(first:100, after:$after) {
        pageInfo { hasNextPage endCursor }
        nodes { path line isResolved comments(first:50) { nodes { author { login } createdAt body } } }
      }
    }
  }
}
' -F owner='newjersey' -F name='navigator.business.nj.gov' -F number=12395 > /tmp/react19_review_threads_page1.json
```

### Spot-check common pattern hotspots

```bash
rg -n "setTimeout\\(" web/src web/test -S
rg -n "flushSync\\(" web/src -S
rg -n "enableAccessibleFieldDOMStructure" web/src -S
rg -n "\\bref\\??:\\s*React\\.Ref<" web/src -S
```

### Doc editing conventions

- If a claim is uncertain or product-intent-dependent, label it **TBD** and include verification steps.
- Avoid hard-coded numeric counts unless you attach an “as of” timestamp and a command to regenerate.
