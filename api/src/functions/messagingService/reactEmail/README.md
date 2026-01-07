# React Email

This workspace uses [React Email](https://react.email/) to build HTML emails as React components.

## Development

Each `.tsx` file in the `./emails` folder is treated as an email. To preview and iterate on these:

```bash
cd api/src/functions/messagingService/reactEmail
yarn dev:email
```

This starts a preview app at `localhost:3001` where you can view emails, check compatibility across email clients, and check for spam / abuse indicators.

## Building

Compile email components to static HTML:

```bash
yarn build  # from repo root, or yarn build from this directory
```

The build script (`build.tsx`) renders React Email components to HTML and outputs them to `../email-templates/`. The messaging service Lambda reads these pre-built HTML files as strings at runtime.

## Adding a new email

1. Create a component in `./emails` (e.g., `MyNewEmail.tsx`)
2. Update `build.tsx` to import and render your component
3. Run `yarn build` to generate the HTML
4. Commit both the React component and generated HTML
