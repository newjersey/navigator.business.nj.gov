# Report Template

## Current status

- Analysis window in America/New_York and UTC.
- Current relevant alarm and operational-control state.
- Whether the reported condition is ongoing, resolved, or unknown.

## Findings

Lead with ongoing, user-impacting problems. For each finding provide:

- Component and normalized signature.
- First and last occurrence.
- Requests or invocations affected, not only log-line count.
- Root-cause confidence label.
- Evidence chain from metric to logs to code or dependency.
- Whether the condition is ongoing, resolved, expected, or monitoring noise.

Keep events outside the requested window in a clearly labeled historical
context section. Do not rank them above in-window findings unless their impact
remains active.

## Causal timeline

For related events, show the sequence from:

- Metric datapoint or reported symptom.
- Alarm transition.
- Correlated log signature.
- Application, dependency, or AWS service behavior.
- Downstream automation or user impact.

Omit this section when events are independent or timestamps do not establish a
defensible sequence.

## Most important attention item

Name one issue. Explain why it outranks the others using current impact,
recurrence, data-safety risk, or monitoring blindness.

## Focus-specific evidence

Include evidence specific to the engineer's question, such as deployment
changes, dependency responses, migration progress, configuration state, traffic
patterns, or capacity metrics. State clearly when potentially useful scans or
other data access were not requested and therefore not performed.

## Recommended actions

Provide a short ordered list. Do not implement changes during analysis.

## Limitations

List failed evidence sources, omitted scans, unavailable telemetry, and any
causal conclusion that remains inferred.
