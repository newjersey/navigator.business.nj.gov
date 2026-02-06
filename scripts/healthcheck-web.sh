#!/usr/bin/env sh

echo "$(date): Starting health check debug"
echo "$(date): Checking if port 3000 is listening"
netstat -ln | grep :3000
echo "$(date): Attempting curl to health endpoint"
curl -f http://localhost:3000/healthz
echo "$(date): Health check debug complete"
