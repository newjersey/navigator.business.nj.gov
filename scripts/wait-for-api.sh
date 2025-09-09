#!/bin/bash
set -e

echo "Waiting for API service to be fully ready on port 5002..."

ATTEMPTS=0
MAX_ATTEMPTS=40
SLEEP_TIME=3
BUFFER_TIME=60

until curl -sf http://localhost:5002/api/ready >/dev/null; do
  ATTEMPTS=$((ATTEMPTS+1))
  if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
    echo "/api/ready did not respond within expected time. Exiting."
    exit 1
  fi
  echo "/api/ready not ready yet, retrying... ($ATTEMPTS/$MAX_ATTEMPTS)"
  sleep $SLEEP_TIME
done

echo "/api/ready is responding!"
echo "Giving API $BUFFER_TIME seconds to finish internal startup..."
sleep $BUFFER_TIME

echo "API is now ready for integration tests!"
