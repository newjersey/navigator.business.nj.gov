#!/usr/bin/env python3
"""
Add a new API feature flag to all relevant configuration files.

Edits:
  api/.env-template
  api/cdk/lib/lambdaStack.ts          (Lambda runtime env vars)
  .github/workflows/build-and-test.yml
  .github/workflows/deploy-dev-environment.yml
  .github/workflows/deploy-staging-environment.yml
  .github/workflows/deploy-content-environment.yml
  .github/workflows/testing-deployment-trigger.yml
  .github/workflows/release-pipeline.yml

Usage:
  python3 scripts/add-api-feature-flag.py MY_NEW_FEATURE
  python3 scripts/add-api-feature-flag.py MY_NEW_FEATURE --gh --ci-value true
  python3 scripts/add-api-feature-flag.py MY_NEW_FEATURE --dry-run
"""

from __future__ import annotations

import argparse
import sys
from functools import partial
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from _feature_flag import (
    LAMBDA_STACK_CONST_ANCHOR,
    LAMBDA_STACK_ENV_ANCHOR,
    ROOT,
    FileEdit,
    Insertion,
    apply_file_update,
    build_workflow_edits,
    insert_after_last_match,
    normalize_flag_name,
    preview_file_update,
    preview_gh_commands,
    preview_ssm_commands,
    run_gh_commands,
    run_ssm_commands,
    to_camel_case,
)


def parse_args() -> argparse.Namespace:
    """Parse and return command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Add a new API feature flag to all configuration files.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "name",
        help=(
            "Flag name, e.g. MY_FEATURE or FEATURE_MY_FEATURE. "
            "The FEATURE_ prefix is added automatically if absent."
        ),
    )
    parser.add_argument(
        "--gh",
        action="store_true",
        help="Create GitHub environment variables for dev/staging/prod via the gh CLI.",
    )
    parser.add_argument(
        "--ssm",
        action="store_true",
        help="Create AWS SSM String parameters at /dev|staging|prod/FEATURE_X via the AWS CLI.",
    )
    parser.add_argument(
        "--ci-value",
        default="false",
        choices=["true", "false"],
        dest="ci_value",
        help="Value hard-coded in CI (build-and-test.yml). Default: false.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        dest="dry_run",
        help="Show what would change without writing any files.",
    )
    return parser.parse_args()


# ---------------------------------------------------------------------------
# API-specific transforms
# ---------------------------------------------------------------------------


def transform_api_env_template(flag: str, content: str) -> str:
    """Append FEATURE_NAME= to api/.env-template."""
    return content.rstrip("\n") + f"\n{flag}=\n"


def transform_lambda_stack(flag: str, content: str) -> str:
    """
    Add two entries to api/cdk/lib/lambdaStack.ts:
      1. A const that reads the env var:  const featureX = process.env.FEATURE_X || "";
      2. An environment object entry:     FEATURE_X: featureX,

    The const must be inserted before the env entry because the env entry
    references the const by name. Without entry (2), the flag reads as
    undefined in the Lambda at runtime even when the CDK stack was deployed
    with the variable present.
    """
    camel = to_camel_case(flag)
    with_const = insert_after_last_match(
        content,
        Insertion(
            anchor=LAMBDA_STACK_CONST_ANCHOR,
            new_line=f'    const {camel} = process.env.{flag} || "";',
        ),
    )
    return insert_after_last_match(
        with_const,
        Insertion(
            anchor=LAMBDA_STACK_ENV_ANCHOR,
            new_line=f"        {flag}: {camel},",
        ),
    )


def build_api_edits(flag: str, ci_value: str) -> list[FileEdit]:
    """Return all FileEdit objects for an API feature flag, in execution order."""
    return [
        FileEdit(
            path=ROOT / "api" / ".env-template",
            transform=partial(transform_api_env_template, flag),
        ),
        FileEdit(
            path=ROOT / "api" / "cdk" / "lib" / "lambdaStack.ts",
            transform=partial(transform_lambda_stack, flag),
        ),
        *build_workflow_edits(flag, ci_value),
    ]


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def main() -> None:
    """Orchestrate all file edits and optional external tool calls."""
    args = parse_args()
    flag = normalize_flag_name(args.name)

    print(f"Adding API feature flag: {flag}")
    if args.dry_run:
        print("  (dry run — no files will be written)\n")

    update = preview_file_update if args.dry_run else apply_file_update
    for edit in build_api_edits(flag, args.ci_value):
        update(edit, flag)

    if args.gh:
        print("\nSetting GitHub environment variables:")
        gh_fn = preview_gh_commands if args.dry_run else run_gh_commands
        gh_fn(flag)

    if args.ssm:
        print("\nCreating AWS SSM parameters:")
        ssm_fn = preview_ssm_commands if args.dry_run else run_ssm_commands
        ssm_fn(flag)

    print(f"\nDone. Use the flag in your Express app:")
    print(f'  if ((process.env.{flag} ?? "false") === "true") {{ ... }}')
    if args.ssm:
        print(
            f"\nNote: for runtime toggling without redeployment, add {flag!r} to CONFIG_VARS "
            f"in api/src/libs/ssmUtils.ts and call getConfigValue('{flag}') "
            "instead of reading process.env directly."
        )


if __name__ == "__main__":
    main()
