# reactEmail/

React Email workspace for building static HTML and plaintext email templates.
The messaging service Lambda reads generated templates from
`api/src/functions/messagingService/email-templates/` at runtime.

## Commands

```bash
yarn dev:email      # Preview app on localhost:3001
yarn build          # Render templates to static HTML and text
```

From the repo root, use the workspace name:

```bash
yarn workspace @businessnjgovnavigator/react-email build
yarn workspace @businessnjgovnavigator/react-email dev:email
```

## Adding or Changing Emails

- Email React components live in `emails/`.
- Shared email components live in `components/`.
- `build.tsx` imports each email component and writes generated `.html` and
  `.txt` files to `../email-templates/`.
- When adding an email, update `build.tsx` and commit both the source component
  and generated template output.

## Practices

- Email markup has stricter client compatibility constraints than normal web UI.
  Prefer React Email components and existing local patterns over custom HTML.
- Keep copy plain and actionable. Include plaintext output for every HTML email.
- Do not depend on browser-only APIs; templates are rendered by the build script.
