#!/usr/bin/env bash
set -euo pipefail
(set +x 2>/dev/null) || true

echo "Checking for existing ADO token..."

ADO_RESOURCE_ID="499b84ac-1321-427f-aa17-267ca6975798"
DEFAULT_TENANT_ID="5076c3d1-3802-4b9f-b36a-e0a41bd642a7"

get_token() {
  az account get-access-token \
    --resource "$ADO_RESOURCE_ID" \
    --query accessToken -o tsv 2>/dev/null || true
}

ADO_BEARER_TOKEN="$(get_token)"

if [[ -z "$ADO_BEARER_TOKEN" ]]; then
  TENANT_ID="${ADO_TENANT_ID:-$DEFAULT_TENANT_ID}"

  echo "Token missing or expired. Logging in (tenant: $TENANT_ID)..."
  az login --tenant "$TENANT_ID" --allow-no-subscriptions >/dev/null

  ADO_BEARER_TOKEN="$(get_token)"
fi

if [[ -z "$ADO_BEARER_TOKEN" ]]; then
  echo "Failed to obtain ADO bearer token."
  echo "Troubleshooting:"
  echo "  - Ensure Azure CLI is installed: az version"
  echo "  - Run: az login --tenant <tenantId> --allow-no-subscriptions"
  exit 1
fi

echo "ADO token acquired."

PYTHON_BIN="python3"
if [[ -x ".venv/bin/python" ]]; then
  PYTHON_BIN=".venv/bin/python"
fi

ADO_BEARER_TOKEN="$ADO_BEARER_TOKEN" "$PYTHON_BIN" scripts/release-helper.py
