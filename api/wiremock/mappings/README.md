# GovDelivery WireMock Stubs

## Testing Failure Paths

By default, GovDelivery stubs return HTTP 200 (success). To test failure handling:

1. Using WireMock Admin API, set the scenario state to "Failure" for the targeted endpoint:

   **GovDeliverySubscribe**

   ```bash
   curl -X PUT http://localhost:9000/__admin/scenarios/GovDeliverySubscribe/state -H "Content-Type: application/json" -d '{"state": "Failure"}'
   ```

   **GovDeliveryUnsubscribe**

   ```bash
   curl -X PUT http://localhost:9000/__admin/scenarios/GovDeliveryUnsubscribe/state -H "Content-Type: application/json" -d '{"state": "Failure"}'
   ```

   **GovDeliveryUpdateEmail**

   ```bash
   curl -X PUT http://localhost:9000/__admin/scenarios/GovDeliveryUpdateEmail/state -H "Content-Type: application/json" -d '{"state": "Failure"}'
   ```

2. Once finished, reset all scenario states back to "Started":

   **GovDeliverySubscribe**

   ```bash
   curl -X PUT http://localhost:9000/__admin/scenarios/GovDeliverySubscribe/state -H "Content-Type: application/json" -d '{"state": "Started"}'
   ```

   **GovDeliveryUnsubscribe**

   ```bash
   curl -X PUT http://localhost:9000/__admin/scenarios/GovDeliveryUnsubscribe/state -H "Content-Type: application/json" -d '{"state": "Started"}'
   ```

   **GovDeliveryUpdateEmail**

   ```bash
   curl -X PUT http://localhost:9000/__admin/scenarios/GovDeliveryUpdateEmail/state -H "Content-Type: application/json" -d '{"state": "Started"}'
   ```

3. **View current scenario states**:
   ```bash
   curl http://localhost:9000/__admin/scenarios
   ```

## Scenario States

- **Started** (default): All requests return HTTP 200
  - Note: While "Success" would be a more intuitive name for this state, `"Started"` is the default value dictated by Wiremock itself (see [these docs](https://wiremock.org/docs/stateful-behaviour/#scenarios) for more info).
- **Failure**: All requests return HTTP 500
