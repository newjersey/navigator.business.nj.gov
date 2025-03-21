#!/bin/bash

################################################################################
# CMS Git Branch Rebaser
# ------------------
# This script automates the process of rebasing multiple CMS-related Git branches
# onto the main branch, handling specific file location conflicts that occur when
# files need to be moved between directories.
#
# Usage:
#   ./rebase-branches.sh [--dry-run]
#
# Options:
#   --dry-run    Show what branches would be processed without making changes
#
# Requirements:
#   - Git
#   - Bash 4+
#   - Write access to the repository
################################################################################

set -e  # Exit on any error

# Prevent Git from opening an editor for commit messages
export GIT_EDITOR=true

################################################################################
# Color code definitions for terminal output
################################################################################
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

################################################################################
# Logs a message with timestamp and emoji
#
# Arguments:
#   $1 - Message to log
#   $2 - Log level (error|success|warning|info)
#
# Output:
#   Formatted log message with timestamp and appropriate emoji
################################################################################
log() {
    local emoji
    local color

    emoji="🔄"  # Default emoji
    color="$BLUE"  # Default color

    case "$2" in
        "error")   emoji="❌"; color="$RED";;
        "success") emoji="✅"; color="$GREEN";;
        "warning") emoji="⚠️"; color="$YELLOW";;
        "info")    emoji="ℹ️"; color="$BLUE";;
    esac

    echo -e "${color}${emoji} $(date +'%Y-%m-%d %H:%M:%S') - $1${NC}"
}

################################################################################
# Performs cleanup operations when an error occurs
#
# Global:
#   local_branch - The branch being processed
#
# Returns:
#   1 - Always exits with error status
################################################################################
cleanup_after_error() {
    local current_branch
    current_branch=$(git rev-parse --abbrev-ref HEAD || echo "unknown")

    log "Aborting rebase due to error." "error"
    git rebase --abort || log "Rebase abort failed or was not necessary." "warning"

    if echo "$current_branch" | grep -q "^cms/"; then
        log "Switching back to main branch." "info"
        git checkout main || log "Failed to switch to main branch." "error"

        log "Deleting local branch $local_branch." "info"
        git branch -D "$local_branch" 2>/dev/null || log "Failed to delete local branch $local_branch." "warning"
    fi

    exit 1
}

################################################################################
# Handles file location conflicts during rebase
#
# This function specifically handles cases where a file needs to be moved from
# one directory to another during a rebase operation. It extracts the file
# content from the original commit and creates it in the new location.
#
# Arguments:
#   $1 - The conflict message from Git
#
# Returns:
#   0 - If conflict was successfully resolved
#   1 - If there was an error resolving the conflict
################################################################################
handle_file_location_conflict() {
    local conflict_message="$1"
    local old_path
    local new_path
    local target_dir
    local commit_hash

    # Extract the file paths using more precise patterns
    old_path=$(echo "$conflict_message" | grep -o "content/src/[^[:space:]]*\.md" | head -1)
    new_path=$(echo "$conflict_message" | grep -o "suggesting it should perhaps be moved to \(.*\.md\)" | sed 's/suggesting it should perhaps be moved to //')

    if [[ -z "$old_path" || -z "$new_path" ]]; then
        log "Failed to extract file paths from conflict message:" "error"
        log "$conflict_message" "error"
        return 1
    fi

    log "Attempting to resolve conflict by creating file at new location:" "info"
    log "Original path: $old_path" "info"
    log "New path:     $new_path" "info"

    # Ensure target directory exists
    target_dir=$(dirname "$new_path")
    if ! mkdir -p "$target_dir"; then
        log "Failed to create target directory: $target_dir" "error"
        return 1
    fi

    # Get the commit hash from the conflict message
    commit_hash=$(echo "$conflict_message" | grep -o "added in [[:alnum:]]* " | awk '{print $3}')
    if [[ -z "$commit_hash" ]]; then
        log "Failed to extract commit hash from conflict message" "error"
        return 1
    fi

    # Get the file content from the commit
    if ! git show "$commit_hash:$old_path" > "$new_path" 2>/dev/null; then
        log "Failed to get file content from commit $commit_hash" "error"
        return 1
    fi

    # Stage the new file
    if ! git add "$new_path"; then
        log "Failed to stage new file" "error"
        return 1
    fi

    log "Successfully created and staged file at new location" "success"
    return 0
}

################################################################################
# Main Script Execution
################################################################################

# Fetch the latest changes from the remote
log "Fetching latest changes from origin." "info"
git fetch origin

# Get a list of branches matching the pattern "origin/cms/*"
branches=$(git branch -r | grep 'origin/cms/')
log "Found branches: $branches" "info"

# Base branch to rebase onto
base_branch="origin/main"

# Loop through each branch
for branch in $branches; do
    local_branch=${branch#origin/}
    log "Processing branch: $local_branch" "info"

    if [[ "$1" == "--dry-run" ]]; then
        log "Dry run: Would process $local_branch" "info"
        continue
    fi

    # Checkout and set up the branch
    if ! git checkout -B "$local_branch" "$branch"; then
        log "Failed to checkout branch $local_branch" "error"
        cleanup_after_error
    fi

    if ! git branch --set-upstream-to=origin/"$local_branch"; then
        log "Failed to set upstream for $local_branch" "error"
        cleanup_after_error
    fi

    # Attempt to rebase
    rebase_output=$(git rebase "$base_branch" 2>&1) || {
        if echo "$rebase_output" | grep -q "CONFLICT (file location)"; then
            log "Detected file location conflict" "warning"

            if handle_file_location_conflict "$rebase_output"; then
                log "Attempting to continue rebase" "info"
                if ! git rebase --continue; then
                    log "Failed to continue rebase after conflict resolution" "error"
                    cleanup_after_error
                fi
            else
                log "Failed to resolve file location conflict" "error"
                cleanup_after_error
            fi
        else
            log "Unhandled conflict or error during rebase:" "error"
            log "$rebase_output" "error"
            cleanup_after_error
        fi
    }

    # Verify we're on the correct branch and rebase was successful
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$current_branch" != "$local_branch" ]]; then
        log "Unexpected branch state after rebase. Expected: $local_branch, Got: $current_branch" "error"
        cleanup_after_error
    fi

    # Push changes only if everything was successful
    if ! git push --force-with-lease; then
        log "Failed to push changes to $local_branch" "error"
        cleanup_after_error
    fi

    log "Successfully pushed branch $local_branch" "success"

    # Cleanup
    if ! git checkout main; then
        log "Failed to checkout main branch" "error"
        cleanup_after_error
    fi

    if ! git branch -d "$local_branch"; then
        log "Failed to delete local branch $local_branch" "warning"
    fi

    log "Successfully processed branch $local_branch" "success"
done

log "All branches processed successfully. 🎉" "success"
