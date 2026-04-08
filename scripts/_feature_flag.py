"""
Shared utilities for add-api-feature-flag.py and add-web-feature-flag.py.

Not intended to be run directly.
"""

from __future__ import annotations

import re
import subprocess
from dataclasses import dataclass
from functools import partial
from pathlib import Path
from typing import Callable

ROOT = Path(__file__).resolve().parent.parent
"""Absolute path to the repository root, used to build file paths and display relative paths."""


# ---------------------------------------------------------------------------
# Anchor patterns
#
# Each constant is a named engineering decision encoding a structural fact
# about a specific file. The last line matching the anchor is used as the
# insertion point, so each new flag lands after the previously added one.
#
# When a file's structure changes, update the constant and its comment to
# describe the new reference point.
# ---------------------------------------------------------------------------

BUILD_AND_TEST_ANCHOR: str = r'  FEATURE_\S+: "(?:true|false)"'
"""
build-and-test.yml: flags are hard-coded as YAML string scalars, not GitHub
expressions, so CI runs are hermetic and independent of any environment
variable state in GitHub. New flags are inserted into this same hard-coded
block so the CI behaviour is always predictable.
"""

DEPLOY_DEV_ANCHOR: str = r"      FEATURE_\S+: \$\{\{ vars\.FEATURE_\S+_DEV \}\}"
"""
deploy-dev-environment.yml: each flag maps to a per-flag GitHub variable
suffixed with _DEV, scoped to the "dev" environment in GitHub Actions so
it cannot be confused with staging or production values.
"""

DEPLOY_STAGING_ANCHOR: str = r"      FEATURE_\S+: \$\{\{ vars\.FEATURE_\S+_STAGING \}\}"
"""
deploy-staging-environment.yml: analogous to the dev anchor but scoped to
the "staging" environment in GitHub Actions.
"""

DEPLOY_GENERIC_ANCHOR: str = r"      FEATURE_\S+: \$\{\{ vars\.FEATURE_\S+ \}\}"
"""
deploy-content-environment.yml and testing-deployment-trigger.yml: these
workflows mix variable suffixes (_DEV, _CONTENT, _TESTING), so a
suffix-agnostic anchor is used. New flags default to _DEV.
"""

RELEASE_PIPELINE_ANCHOR: str = (
    r'          echo "FEATURE_\S+=\$\{\{ vars\.FEATURE_\S+_PROD \}\}" >> \$GITHUB_ENV'
)
"""
release-pipeline.yml: production flags are exported via bash echo rather
than a top-level env: block, which is a structural difference from the
dev/staging workflows. The anchor matches the echo statement form used
for all existing production feature flags.
"""

LAMBDA_STACK_CONST_ANCHOR: str = r'    const feature\w+ = process\.env\.FEATURE_\w+ \|\| "";'
"""
api/cdk/lib/lambdaStack.ts: the block of const declarations that read feature
flag environment variables from the CDK deployment context before passing them
to createLambda. New consts are appended here.
"""

LAMBDA_STACK_ENV_ANCHOR: str = r"        FEATURE_\w+: \w+,"
"""
api/cdk/lib/lambdaStack.ts: the environment object passed to createLambda.
New entries are appended here to expose the flag to the Lambda function at
runtime. Without this entry the flag reads as undefined in the Lambda even
when the CDK stack was deployed with the variable set.
"""

NEXT_CONFIG_ANCHOR: str = r'    FEATURE_\S+: process\.env\.FEATURE_\S+ \?\? "false",'
"""
web/next.config.js: the env block that bakes environment variables into the
Next.js build output. Without an entry here, process.env.FEATURE_X is
undefined in both server-side and client-side Next.js code regardless of
whether the variable is present in the Docker environment at build time.
"""


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Insertion:
    """
    Specifies where and what to insert within file content.

    anchor:   Regex pattern identifying the insertion point. The last line
              matching the pattern is used so that successive additions are
              naturally appended after one another.
    new_line: The complete line to insert after the anchor match.
              Do not include a trailing newline; insert_after_last_match adds one.
    """

    anchor: str
    new_line: str


@dataclass(frozen=True)
class FileEdit:
    """
    Associates a file path with the content transformation to apply to it.

    Declaring edits as a typed list of FileEdit objects before any I/O begins
    lets --dry-run validate all transforms against the current file contents
    without writing anything.
    """

    path: Path
    transform: Callable[[str], str]


@dataclass(frozen=True)
class CiConfig:
    """
    Configuration for a single entry in the build-and-test.yml env block.

    ci_value is hard-coded (not a GitHub expression) to keep CI hermetic:
    tests always run against a known flag state regardless of the GitHub
    variable configured for any given environment.
    """

    flag: str
    """The FEATURE_* environment variable name, e.g. FEATURE_MY_FLAG."""

    ci_value: str
    """Hard-coded CI value: "true" or "false"."""


@dataclass(frozen=True)
class DeployConfig:
    """
    Configuration for a YAML env block entry in a deploy workflow.

    The suffix controls which GitHub environment variable is referenced.
    For example, suffix="DEV" produces FEATURE_X_DEV, scoped to the "dev"
    environment in GitHub Actions.
    """

    flag: str
    """The FEATURE_* environment variable name."""

    suffix: str
    """GitHub variable suffix: DEV, STAGING, PROD, CONTENT, TESTING, etc."""


# ---------------------------------------------------------------------------
# Core utilities
# ---------------------------------------------------------------------------


def normalize_flag_name(name: str) -> str:
    """
    Return the canonical FEATURE_* environment variable name.

    Adds the FEATURE_ prefix if absent and uppercases the result. Raises
    SystemExit with a descriptive message if the name contains invalid
    characters, so the error is surfaced before any file is touched.
    """
    upper = name.strip().upper()
    if not upper.startswith("FEATURE_"):
        upper = f"FEATURE_{upper}"
    if not re.fullmatch(r"FEATURE_[A-Z][A-Z0-9_]*", upper):
        raise SystemExit(
            f"Error: invalid flag name {name!r}. "
            "Use only ASCII letters, digits, and underscores (e.g. MY_NEW_FEATURE)."
        )
    return upper


def to_camel_case(flag_name: str) -> str:
    """
    Convert a FEATURE_* name to camelCase for use as a TypeScript variable name.

    Example: FEATURE_MY_NEW_FLAG → featureMyNewFlag
    """
    parts = flag_name.lower().split("_")
    return parts[0] + "".join(part.capitalize() for part in parts[1:])


def insert_after_last_match(content: str, spec: Insertion) -> str:
    """
    Return content with spec.new_line inserted after the last line matching spec.anchor.

    Raises ValueError (not SystemExit) so that callers can annotate the error
    with the file path before surfacing it to the user.
    """
    matches = list(re.finditer(spec.anchor, content, re.MULTILINE))
    if not matches:
        raise ValueError(
            "could not find an insertion point.\n"
            f"Expected a line matching: {spec.anchor!r}\n"
            "The file may have diverged from the expected structure."
        )
    last = matches[-1]
    line_end = content.find("\n", last.start())
    if line_end == -1:
        line_end = len(content)
    return content[: line_end + 1] + spec.new_line + "\n" + content[line_end + 1 :]


# ---------------------------------------------------------------------------
# File I/O — split on the dry_run axis rather than using a boolean parameter
# ---------------------------------------------------------------------------


def preview_file_update(edit: FileEdit, flag: str) -> None:
    """
    Validate that edit.transform would succeed and print what would be written,
    without making any changes to disk.

    Skips with a diagnostic message if flag is already present in the file.
    Raises SystemExit if the transform cannot find its insertion anchor, so
    a dry run surfaces structural errors in the same way a live run would.
    """
    content = edit.path.read_text()
    if flag in content:
        print(f"  skip  {edit.path.relative_to(ROOT)}  (already present)")
        return
    try:
        edit.transform(content)
    except ValueError as exc:
        raise SystemExit(f"Error: {edit.path.relative_to(ROOT)}\n{exc}") from exc
    print(f"  [dry] {edit.path.relative_to(ROOT)}")


def apply_file_update(edit: FileEdit, flag: str) -> None:
    """
    Apply edit.transform to the file at edit.path and write the result to disk.

    Skips with a diagnostic message if flag is already present in the file.
    Raises SystemExit if the transform cannot find its insertion anchor.
    """
    content = edit.path.read_text()
    if flag in content:
        print(f"  skip  {edit.path.relative_to(ROOT)}  (already present)")
        return
    try:
        updated = edit.transform(content)
    except ValueError as exc:
        raise SystemExit(f"Error: {edit.path.relative_to(ROOT)}\n{exc}") from exc
    edit.path.write_text(updated)
    print(f"  ok    {edit.path.relative_to(ROOT)}")


# ---------------------------------------------------------------------------
# Workflow file transforms
# ---------------------------------------------------------------------------


def transform_build_and_test(config: CiConfig, content: str) -> str:
    """Insert a hard-coded flag entry in the CI env block of build-and-test.yml."""
    return insert_after_last_match(
        content,
        Insertion(
            anchor=BUILD_AND_TEST_ANCHOR,
            new_line=f'  {config.flag}: "{config.ci_value}"',
        ),
    )


def transform_deploy_dev(flag: str, content: str) -> str:
    """Map FEATURE_X to ${{ vars.FEATURE_X_DEV }} in deploy-dev-environment.yml."""
    return insert_after_last_match(
        content,
        Insertion(
            anchor=DEPLOY_DEV_ANCHOR,
            new_line=f"      {flag}: ${{{{ vars.{flag}_DEV }}}}",
        ),
    )


def transform_deploy_staging(flag: str, content: str) -> str:
    """Map FEATURE_X to ${{ vars.FEATURE_X_STAGING }} in deploy-staging-environment.yml."""
    return insert_after_last_match(
        content,
        Insertion(
            anchor=DEPLOY_STAGING_ANCHOR,
            new_line=f"      {flag}: ${{{{ vars.{flag}_STAGING }}}}",
        ),
    )


def transform_deploy_generic(config: DeployConfig, content: str) -> str:
    """
    Map FEATURE_X to ${{ vars.FEATURE_X_{SUFFIX} }} using a suffix-agnostic anchor.

    Used for workflows that mix variable suffixes (deploy-content, testing-trigger).
    """
    return insert_after_last_match(
        content,
        Insertion(
            anchor=DEPLOY_GENERIC_ANCHOR,
            new_line=f"      {config.flag}: ${{{{ vars.{config.flag}_{config.suffix} }}}}",
        ),
    )


def transform_release_pipeline(flag: str, content: str) -> str:
    """Append a PROD echo line to the environment export block in release-pipeline.yml."""
    return insert_after_last_match(
        content,
        Insertion(
            anchor=RELEASE_PIPELINE_ANCHOR,
            new_line=f'          echo "{flag}=${{{{ vars.{flag}_PROD }}}}" >> $GITHUB_ENV',
        ),
    )


def build_workflow_edits(flag: str, ci_value: str) -> list[FileEdit]:
    """
    Return FileEdit objects for the five workflow files modified by both
    add-api-feature-flag.py and add-web-feature-flag.py.
    """
    workflows = ROOT / ".github" / "workflows"
    return [
        FileEdit(
            path=workflows / "build-and-test.yml",
            transform=partial(transform_build_and_test, CiConfig(flag=flag, ci_value=ci_value)),
        ),
        FileEdit(
            path=workflows / "deploy-dev-environment.yml",
            transform=partial(transform_deploy_dev, flag),
        ),
        FileEdit(
            path=workflows / "deploy-staging-environment.yml",
            transform=partial(transform_deploy_staging, flag),
        ),
        FileEdit(
            path=workflows / "deploy-content-environment.yml",
            transform=partial(transform_deploy_generic, DeployConfig(flag=flag, suffix="DEV")),
        ),
        FileEdit(
            path=workflows / "testing-deployment-trigger.yml",
            transform=partial(transform_deploy_generic, DeployConfig(flag=flag, suffix="DEV")),
        ),
        FileEdit(
            path=workflows / "release-pipeline.yml",
            transform=partial(transform_release_pipeline, flag),
        ),
    ]


# ---------------------------------------------------------------------------
# GitHub CLI integration — split on the dry_run axis
# ---------------------------------------------------------------------------


def _invoke_gh_variable(env_name: str, var_name: str) -> str | None:
    """
    Set a single GitHub environment variable to "false" via the gh CLI.

    Returns a failure description if the command exits non-zero, or None on
    success. The initial value of "false" is intentionally conservative;
    enable the flag via the GitHub UI or a follow-up gh command once it is
    ready to be activated.
    """
    cmd = ["gh", "variable", "set", var_name, "--env", env_name, "--body", "false"]
    print(f"  $ {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return f"{var_name} in {env_name}: {result.stderr.strip()}"
    return None


def preview_gh_commands(flag: str) -> None:
    """Print the gh CLI commands that run_gh_commands would execute."""
    for env_name, var_name in _gh_entries(flag):
        print(f"  [dry] $ gh variable set {var_name} --env {env_name} --body false")


def run_gh_commands(flag: str) -> None:
    """
    Create GitHub environment variables for dev, staging, and prod via the gh CLI.

    Runs all three commands before reporting failures so that a partial success
    does not go unnoticed. Raises SystemExit if any command fails.
    """
    failures: list[str] = []
    for env_name, var_name in _gh_entries(flag):
        error = _invoke_gh_variable(env_name, var_name)
        if error is not None:
            failures.append(error)
    if failures:
        raise SystemExit(
            "GitHub variable creation failed:\n" + "\n".join(f"  {f}" for f in failures)
        )


def _gh_entries(flag: str) -> list[tuple[str, str]]:
    """Return the (environment, variable_name) pairs for the three GitHub environments."""
    return [
        ("dev", f"{flag}_DEV"),
        ("staging", f"{flag}_STAGING"),
        ("prod", f"{flag}_PROD"),
    ]


# ---------------------------------------------------------------------------
# AWS SSM integration — split on the dry_run axis
# ---------------------------------------------------------------------------


def _invoke_ssm_parameter(stage: str, flag: str) -> str | None:
    """
    Create or overwrite an AWS SSM String parameter at /{stage}/{flag}.

    Returns a failure description if the command exits non-zero, or None on
    success. The initial value is "false"; update via the AWS console or CLI
    when the flag is ready to activate.
    """
    param_name = f"/{stage}/{flag}"
    cmd = [
        "aws", "ssm", "put-parameter",
        "--name", param_name,
        "--value", "false",
        "--type", "String",
        "--overwrite",
    ]
    print(f"  $ {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return f"{param_name}: {result.stderr.strip()}"
    return None


def preview_ssm_commands(flag: str) -> None:
    """Print the aws CLI commands that run_ssm_commands would execute."""
    for stage in ("dev", "staging", "prod"):
        print(
            f"  [dry] $ aws ssm put-parameter --name /{stage}/{flag} "
            "--value false --type String --overwrite"
        )


def run_ssm_commands(flag: str) -> None:
    """
    Create AWS SSM String parameters for dev, staging, and prod via the AWS CLI.

    Runs all three commands before reporting failures. Raises SystemExit if
    any command fails.
    """
    failures: list[str] = []
    for stage in ("dev", "staging", "prod"):
        error = _invoke_ssm_parameter(stage, flag)
        if error is not None:
            failures.append(error)
    if failures:
        raise SystemExit(
            "SSM parameter creation failed:\n" + "\n".join(f"  {f}" for f in failures)
        )
