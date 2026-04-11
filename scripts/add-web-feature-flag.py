#!/usr/bin/env python3
"""
Add a new web feature flag to all relevant configuration files.

Edits:
  web/.env-template
  web/next.config.js                  (build-time env exposure)
  .github/workflows/build-and-test.yml
  .github/workflows/deploy-dev-environment.yml
  .github/workflows/deploy-staging-environment.yml
  .github/workflows/deploy-content-environment.yml
  .github/workflows/testing-deployment-trigger.yml
  .github/workflows/release-pipeline.yml

Usage:
  python3 scripts/add-web-feature-flag.py MY_NEW_FEATURE
  python3 scripts/add-web-feature-flag.py MY_NEW_FEATURE --gh --ci-value true
  python3 scripts/add-web-feature-flag.py MY_NEW_FEATURE --dry-run

Note: web feature flags are baked into the Next.js build output via the
next.config.js env block. They do NOT require the NEXT_PUBLIC_ prefix because
Next.js exposes all entries in that block to both server-side and client-side
code at build time. Consume them as: process.env.FEATURE_X === "true"
"""

from __future__ import annotations

import argparse
import sys
from functools import partial
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from _feature_flag import (
    NEXT_CONFIG_ANCHOR,
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
)


def parse_args() -> argparse.Namespace:
    """Parse and return command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Add a new web feature flag to all configuration files.",
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
# Web-specific transforms
# ---------------------------------------------------------------------------


def transform_web_env_template(flag: str, content: str) -> str:
    """Append FEATURE_NAME= to web/.env-template."""
    return content.rstrip("\n") + f"\n{flag}=\n"


def transform_next_config(flag: str, content: str) -> str:
    """
    Insert the flag into the env block of web/next.config.js.

    Without this entry, process.env.FEATURE_X is undefined in both server-side
    and client-side Next.js code even if the variable is set in the environment
    at build time. The default of "false" matches the convention used by all
    existing feature flags in that block.
    """
    return insert_after_last_match(
        content,
        Insertion(
            anchor=NEXT_CONFIG_ANCHOR,
            new_line=f'    {flag}: process.env.{flag} ?? "false",',
        ),
    )


def build_web_edits(flag: str, ci_value: str) -> list[FileEdit]:
    """Return all FileEdit objects for a web feature flag, in execution order."""
    return [
        FileEdit(
            path=ROOT / "web" / ".env-template",
            transform=partial(transform_web_env_template, flag),
        ),
        FileEdit(
            path=ROOT / "web" / "next.config.js",
            transform=partial(transform_next_config, flag),
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

    print(f"Adding web feature flag: {flag}")
    if args.dry_run:
        print("  (dry run — no files will be written)\n")

    update = preview_file_update if args.dry_run else apply_file_update
    for edit in build_web_edits(flag, args.ci_value):
        update(edit, flag)

    if args.gh:
        print("\nSetting GitHub environment variables:")
        gh_fn = preview_gh_commands if args.dry_run else run_gh_commands
        gh_fn(flag)

    if args.ssm:
        print("\nCreating AWS SSM parameters:")
        ssm_fn = preview_ssm_commands if args.dry_run else run_ssm_commands
        ssm_fn(flag)

    short = flag.replace("FEATURE_", "")
    component_name = "".join(part.capitalize() for part in short.split("_"))
    print(f"\nDone. Use the flag in your components:")
    print(f'  const is{component_name}Enabled = process.env.{flag} === "true";')
    if args.ssm:
        print(
            f"\nNote: web flags are baked in at build time (next.config.js). "
            f"The SSM parameter at /<stage>/{flag} will not be read by Next.js automatically."
        )


if __name__ == "__main__":
    main()
