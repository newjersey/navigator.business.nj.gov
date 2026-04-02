# GovDelivery WireMock Stubs

## Testing Failure Paths

By default, GovDelivery stubs return HTTP 200 (success). To test failure handling:

1. **Using WireMock Admin API** (set scenario state to "Failure"):

   ```bash
   curl -X PUT http://localhost:8080/__admin/scenarios/GovDeliverySubscribe/state -d '{"state": "Failure"}'
   curl -X PUT http://localhost:8080/__admin/scenarios/GovDeliveryUnsubscribe/state -d '{"state": "Failure"}'
   curl -X PUT http://localhost:8080/__admin/scenarios/GovDeliveryUpdateEmail/state -d '{"state": "Failure"}'
   ```

2. **Reset to success** (set state back to "Started"):

   ```bash
   curl -X PUT http://localhost:8080/__admin/scenarios/GovDeliverySubscribe/state -d '{"state": "Started"}'
   curl -X PUT http://localhost:8080/__admin/scenarios/GovDeliveryUnsubscribe/state -d '{"state": "Started"}'
   curl -X PUT http://localhost:8080/__admin/scenarios/GovDeliveryUpdateEmail/state -d '{"state": "Started"}'
   ```

3. **View current scenario states**:
   ```bash
   curl http://localhost:8080/__admin/scenarios
   ```

## Scenario States

- **Started** (default): All requests return HTTP 200
- **Failure**: All requests return HTTP 500
