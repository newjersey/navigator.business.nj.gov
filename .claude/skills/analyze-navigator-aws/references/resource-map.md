# Navigator AWS Resource Map

Use repository definitions as the source of truth. Treat these names as
discovery patterns, not permanent inventory or a mandatory checklist.

## Profiles and stages

| Profile         | Stages                      |
| --------------- | --------------------------- |
| `Innov-Dev`     | `dev`, `content`, `testing` |
| `Innov-Staging` | `staging`                   |
| `Innov-Prod`    | `prod`                      |

Default `Innov-Prod` to `prod`. Require `--stage` for `content` and `testing`.

## Repository discovery

- API monitoring definitions: `api/cdk/lib/monitoringStack.ts`
- Static-site monitoring definitions: `api/cdk/lib/staticSiteMonitoring.ts`
- CDK stacks and resource names: `api/cdk/lib/`
- API handlers, clients, and log emitters: `api/src/`
- Static-site application and logging: `packages/static-site/`
- Frontend request behavior: `web/src/`
- Shared domain and migration types: `shared/src/`

Search these sources before assuming that a resource name, alarm threshold, log
group, or metric remains current.

## Common discovery patterns

- API application logs commonly use `/NavigatorWebService/{stage}/...`.
- Database client logs commonly use `/NavigatorDBClient/{stage}/...`.
- Lambda logs use `/aws/lambda/{function-name}`.
- Static-site logs commonly use `/ecs/bfs-static-site/{stage}`.
- API Lambda names commonly contain `businessnjgov-api-v2-{stage}`.
- DynamoDB tables commonly include the stage in their name.
- Static-site resources commonly include `bfs-static-site` and the stage.

Use `describe-alarms` and `describe-log-groups` to discover the live inventory.
Filter by stage and the investigation focus; do not query every log group by
default.

## Evidence sources

- CloudWatch alarm state and history identify when a signal breached.
- CloudWatch metrics distinguish failures, traffic, latency, capacity, and
  missing telemetry.
- CloudWatch Logs Insights identifies repeated signatures and affected
  requests or invocations.
- Lambda and ECS descriptions identify deployed configuration.
- CloudTrail lookup events identify relevant deployments and configuration
  changes when management events are available.
- AWS Health can support an AWS service-boundary conclusion.
- Repository source explains how the observed event is handled and surfaced.

Choose evidence sources based on the question. Do not collect every source for
every investigation.
