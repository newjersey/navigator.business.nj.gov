# Root-Cause Analysis Playbook

## Causal chain

Build the chain in this order:

1. Alarm transition and the metric datapoint that breached.
2. Resource and operation represented by the metric.
3. Log events in the datapoint window.
4. Repeated or isolated signature and affected invocation/request count.
5. AWS service telemetry such as throttles, system errors, latency, deployment
   events, or Health events.
6. Repository code path that emits or handles the failure.
7. Resulting automation or downstream impact.

Do not skip from an alarm directly to a source-code hypothesis.

## Confidence labels

- `confirmed-application`: Code and logs identify the failing application path
  and behavior.
- `confirmed-dependency`: The application received a specific upstream response
  and handled it as logged.
- `aws-service-boundary`: AWS returned a service-side failure, but internal AWS
  causation is unavailable.
- `inferred`: Multiple signals support the explanation, but a decisive request
  identifier, trace, access log, or data event is missing.
- `unknown`: Evidence is insufficient or contradictory.

## Recurrence

Call a problem ongoing only when at least one condition holds:

- Its alarm remains active.
- The normalized signature recurs near the end of the requested window.
- Recent metrics continue to breach or trend abnormally.
- An operational control or degraded configuration remains active.

Otherwise call it historical or resolved and give the last occurrence.

Do not promote events outside the requested window to the most important current
issue unless their resulting state remains active in the window. Present them as
historical context and recommend a longer window when appropriate.

## Interpretation checks

- Literal `error` metric filters count expected validation and duplicate log
  lines. Report requests separately from emitted log records.
- Lambda `Errors` metrics indicate failed invocations; custom log metrics may
  only indicate text matches.
- A CloudWatch metric with no datapoints is unknown or inactive telemetry, not a
  measured zero. Use the matching `Invocations` metric before claiming a Lambda
  did not run.
- DynamoDB `SystemErrors` without throttle metrics indicate an AWS
  service-boundary failure, not capacity exhaustion.
- DynamoDB `ProvisionedThroughputExceededException` is a capacity problem even
  if the broad write-throttle alarm did not breach.
- `TargetTracking-*AlarmLow*` transitions normally drive scale-down behavior.
- Static-site router-state, server-reference, and server-action errors often
  indicate malformed or stale Next.js requests. Call automated probing an
  inference unless access logs identify the source.
- Successful but excessive requests can indicate a client retry, polling, or
  autosave loop even when error metrics remain healthy.
- A dependency response becomes an application failure when application code
  incorrectly maps, retries, or exposes it. Distinguish the initiating response
  from the user-visible result.

## Evidence limitations

Always mention applicable gaps:

- X-Ray disabled or unavailable.
- CloudTrail data events not enabled.
- AWS Health unavailable to the account.
- Request IDs or SDK metadata discarded by application wrapping.
- Access logs unavailable for source attribution.
- Data access not explicitly authorized.
- Sampling or Logs Insights limits that may omit low-frequency signatures.
