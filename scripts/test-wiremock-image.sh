#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

image="navigator-wiremock-smoke-test"
container=""

cleanup() {
  if [[ -n "$container" ]]; then
    docker rm --force "$container" > /dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

docker build -f api/local.dev.wiremock.Dockerfile -t "$image" .
container="$(docker run --detach --rm \
  --publish 127.0.0.1::9000 \
  --volume "$PWD/api/wiremock:/workspace/api/wiremock:ro" \
  --workdir /workspace/api \
  "$image")"

address="$(docker port "$container" 9000/tcp)"
ready=false
for _ in {1..30}; do
  if curl --fail --silent --max-time 3 "http://${address}/__admin/mappings" > /dev/null; then
    ready=true
    break
  fi
  sleep 1
done
if [[ "$ready" != true ]]; then
  echo "WireMock did not become ready."
  docker logs "$container"
  exit 1
fi

curl --fail --silent --show-error --max-time 10 "http://${address}/Available?q=Aculyst" | \
  python3 -c 'import json, sys; expected = json.load(open(sys.argv[1])); actual = json.load(sys.stdin); assert actual == expected, "WireMock response does not match the fixture"' \
    api/wiremock/__files/business-name-response-unavailable.json

echo "WireMock image serves the expected business-name fixture."
