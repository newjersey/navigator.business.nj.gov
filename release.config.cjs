// ---------------------------------------------------------------------------
// JSDoc types
// ---------------------------------------------------------------------------

/** @typedef {import('conventional-commits-parser').Commit} Commit */
/** @typedef {import('conventional-changelog-writer').Context} WriterContext */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ADO_BASE = "https://dev.azure.com/NJInnovation/Business%20First%20Stop/_workitems/edit";

// ---------------------------------------------------------------------------
// Pure helper functions
// ---------------------------------------------------------------------------

/**
 * Returns true if the commit should be omitted from the changelog.
 * Commits with breaking-change notes are always kept; otherwise only
 * feat / fix / perf / revert are included.
 *
 * @param {Commit} commit
 * @returns {boolean}
 */
const shouldDiscard = (commit) => {
  if (commit.notes.length > 0) return false;
  const releasable = ["feat", "fix", "perf", "revert"];
  return !releasable.includes(commit.type) && !commit.revert;
};

/**
 * Maps a conventional-commit type token to its changelog section label.
 * Preserves the original Angular preset's if-else order so that the
 * `revert || commit.revert` edge case is handled identically.
 *
 * @param {Commit} commit
 * @returns {string | null}
 */
const resolveType = (commit) => {
  if (commit.type === "feat") return "Features";
  if (commit.type === "fix") return "Bug Fixes";
  if (commit.type === "perf") return "Performance Improvements";
  if (commit.type === "revert" || commit.revert) return "Reverts";
  if (commit.type === "docs") return "Documentation";
  if (commit.type === "style") return "Styles";
  if (commit.type === "refactor") return "Code Refactoring";
  if (commit.type === "test") return "Tests";
  if (commit.type === "build") return "Build System";
  if (commit.type === "ci") return "Continuous Integration";
  return commit.type;
};

/**
 * Replaces `[AB#N]` with an Azure DevOps work-item link and bare `#N` with a
 * GitHub issue link in a single regex pass (preventing the ADO-embedded `#N`
 * from being re-matched by the GitHub branch of the alternation).
 *
 * @param {string} subject
 * @param {string | undefined} repoBase  e.g. "https://github.com/org/repo"
 * @returns {{ subject: string, issues: string[] }}
 */
const linkifyIssues = (subject, repoBase) => {
  const issues = [];
  const result = subject.replace(/\[AB#(\d+)\]|#([0-9]+)/g, (match, adoIssue, ghIssue) => {
    if (adoIssue !== undefined) {
      issues.push(adoIssue);
      return `[AB#${adoIssue}](${ADO_BASE}/${adoIssue})`;
    }
    if (ghIssue !== undefined && repoBase) {
      issues.push(ghIssue);
      return `[#${ghIssue}](${repoBase}/issues/${ghIssue})`;
    }
    return match;
  });
  return { subject: result, issues };
};

/**
 * Replaces `@username` mentions with Markdown profile links.
 * Org-scoped handles (`@org/team`) are left as plain text.
 *
 * @param {string} subject
 * @param {string} host  e.g. "https://github.com"
 * @returns {string}
 */
const linkifyMentions = (subject, host) =>
  subject.replace(/\B@([a-z0-9](?:-?[a-z0-9/]){0,38})/g, (_, username) =>
    username.includes("/") ? `@${username}` : `[@${username}](${host}/${username})`,
  );

// ---------------------------------------------------------------------------
// Transform
// ---------------------------------------------------------------------------

/**
 * Transform function for `conventional-changelog-writer`.
 * Replicates the Angular preset's transform with ADO work-item links
 * replacing GitHub issue links for `[AB#N]` references.
 *
 * @param {Commit} commit
 * @param {WriterContext} context
 * @returns {Commit | undefined}
 */
const adoTransform = (commit, context) => {
  commit.notes.forEach((note) => {
    note.title = "BREAKING CHANGES";
  });

  if (shouldDiscard(commit)) return;

  commit.type = resolveType(commit);
  if (commit.scope === "*") commit.scope = "";
  if (typeof commit.hash === "string") commit.shortHash = commit.hash.substring(0, 7);

  if (typeof commit.subject === "string") {
    const repoBase = context.repository
      ? `${context.host}/${context.owner}/${context.repository}`
      : context.repoUrl;

    const { subject, issues } = linkifyIssues(commit.subject, repoBase);
    commit.subject = context.host ? linkifyMentions(subject, context.host) : subject;
    commit.references = commit.references.filter((ref) => !issues.includes(ref.issue));
  }

  return commit;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        parserOpts: { noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"] },
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "angular",
        writerOpts: { transform: adoTransform },
      },
    ],
    "@semantic-release/npm",
    "@semantic-release/changelog",
    ["@semantic-release/github", { successComment: false }],
    "@semantic-release/git",
  ],
};
