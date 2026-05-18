# api/

Express application deployed as AWS Lambda functions. Each Lambda lives in `src/functions/`; business-domain routers live in `src/api/`.

## Commands

```bash
yarn dev            # Hot-reload: starts Express + WireMock + health check + other functions
yarn test           # Jest with DynamoDB Local (requires Docker services running)
yarn test:ci        # CI mode
yarn build          # TypeScript compilation + generate user schema
yarn typecheck
yarn lint
yarn generate:user-schema   # Regenerate Zod schema from TypeScript types
```

## Before Writing New Code

Check these locations first — they likely already have what you need:

- **`src/libs/`** — logging (`logWriter.ts`, `logUtils.ts`), SSM/feature flags (`ssmUtils.ts`), SNS (`awsSns.ts`), Express setup (`express.ts`)
- **`src/client/`** — HTTP clients for 13+ external services (formation, tax, cigarette license, GovDelivery, Dynamics, DEP, etc.)
- **`@businessnjgovnavigator/shared`** — domain types and cross-cutting helpers

## Migration System

Each data migration lives at `src/db/migrations/vNNN_*.ts` and defines the full type tree for that version.

**To add a new migration**, use the script — it handles all the boilerplate:

```bash
bash scripts/generate-new-migration.sh
```

See `scripts/generate-new-migration.sh` and the "Adding a new migration" section in `README.md` for what the script does. After running it, you still need to write the actual migration function by hand.

**Non-obvious rules:**

- Generator functions must **not** explicitly set optional fields to `undefined` — this breaks the migration equality test
- Migration test assertions: count == `CURRENT_VERSION`, last entry is `migrate_v{N-1}_to_v{N}`, migrated user keys == generated user keys

## Router Conventions

- Files: `src/api/[domain]Router.ts` + `src/api/[domain]Router.test.ts` (co-located)
- Routers are registered via `userRouterFactory` in `src/functions/express/app.ts` — add new routers there
- Router factories take all dependencies as parameters (no global singletons)

## User Schema Generation

Zod schemas are auto-generated from TypeScript types. After changing types in `shared/`:

```bash
yarn generate:user-schema    # from api/
```

Do not hand-edit files that have a "generated" header comment.

## Testing

- Uses `jest-dynalite` for an in-process DynamoDB Local — requires no external setup beyond Docker services
- Global DynamoDB setup/teardown is in `test/` — don't replicate it in individual tests
- WireMock on port 9000 stubs external API calls locally (`yarn start:wiremock`)
- Never mock the database in tests; use the real DynamoDB Local instance
