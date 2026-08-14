---
name: analyze-navigator-aws
description: Investigate Navigator AWS incidents, alarms, recurring errors, and operational questions using read-only AWS CLI commands, CloudWatch logs and metrics, and repository source. Use only when an engineer explicitly invokes /analyze-navigator-aws and wants evidence-based root-cause analysis rather than a predetermined diagnostic workflow.
disable-model-invocation: true
argument-hint: "[profile=Innov-Prod] [window=168h] [focus=<question, alarm, or component>]"
---

# Analyze Navigator AWS

Investigate the engineer's question rather than replaying a fixed checklist.
Collect bounded, redacted AWS evidence, follow signals into adjacent telemetry and
repository code, and state the confidence of every root-cause conclusion.

## Arguments

Interpret `$ARGUMENTS` as optional key-value arguments:

- `profile`: default `Innov-Prod`
- `window`: default `168h`; accept hours such as `36h` or `168h`
- `focus`: default `all`; accept a question, alarm, service, endpoint, component,
  migration, or other investigation target
- `stage`: infer from the profile unless supplied

Require `stage` for `Innov-Dev` when the target is `content` or `testing`.

## Workflow

1. Convert the requested window to exact UTC and America/New_York boundaries.
2. Validate the requested identity with `aws sts get-caller-identity`. Stop
   rather than substituting another profile or stage.
3. Read [resource-map.md](references/resource-map.md), then inspect the relevant
   CDK definitions. Treat documented names as discovery hints, not an exhaustive
   inventory.
4. Discover relevant current alarms, alarm history, log groups, and resources.
   Start from the stated focus, then follow evidence into adjacent components.
5. Use alarm `StateReason` datapoint timestamps, not only transition timestamps,
   to establish bounded log and metric query windows.
6. Query relevant CloudWatch log groups iteratively:
   - begin with the alarm period or reported failure window
   - group repeated signatures and count affected requests or invocations
   - widen or narrow the query based on evidence
   - inspect raw events only long enough to identify the source without exposing
     sensitive values
7. Retrieve supporting metrics, configuration, deployment history, dependency
   responses, or AWS Health events only when they help confirm or reject a
   hypothesis.
8. Read [analysis-playbook.md](references/analysis-playbook.md). Follow its
   causal-chain and confidence rules.
9. Inspect the repository path implicated by the evidence: monitoring
   definitions, log emitters, handlers, clients, migrations, and error handling.
10. Determine whether each signal is ongoing, resolved, expected validation,
    monitoring noise, application failure, dependency failure, or an AWS
    service-boundary failure.
11. Format the answer with [report-template.md](references/report-template.md).

## AWS Safety

- Use only read-only AWS operations. Typical operation names begin with
  `describe`, `get`, `list`, `lookup`, or `filter`; CloudWatch Logs
  `start-query` and `get-query-results` are also permitted.
- Never call operations that create, update, delete, invoke, publish, start
  workloads, or otherwise change AWS resources.
- Do not run DynamoDB scans, exports, PartiQL queries, or other bulk record
  access unless the engineer explicitly requests that specific data access.
  Read-only operations can still consume table capacity.
- Bound all log, metric, and history queries to the requested window. Use
  pagination and result limits deliberately.
- Do not request decrypted parameter values unless the specific parameter is
  directly relevant and known to contain operational state rather than a secret.

## Evidence Rules

- Never reproduce user IDs, emails, tax identifiers, sensitive record contents,
  request bodies, credentials, secrets, account IDs, IP addresses, or
  unredacted log lines. Summarize or normalize signatures instead.
- Treat failed commands, missing permissions, unavailable telemetry, and
  deliberately omitted data access as evidence limitations.
- Do not call an event a root cause merely because it occurred nearby.
- Label conclusions as `confirmed-application`, `confirmed-dependency`,
  `aws-service-boundary`, `inferred`, or `unknown`.
- Separate user-facing failures from successful but excessive traffic.
- Do not change AWS state, source code, parameters, alarms, or records.

## Stop Conditions

- Stop and report an authentication problem if STS identity validation fails.
- Stop rather than substitute a different AWS profile.
- If evidence cannot distinguish an application error from an AWS internal
  failure, stop the causal chain at the AWS service boundary and identify the
  missing telemetry needed to go further.
