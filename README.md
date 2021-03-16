# Business.NJ.Gov Dashboard

This is the development repository for the business.nj.gov dashboard.

## Architecture

Everything is **TypeScript**.

The frontend is **React** with **next.js**, deployed on **AWS Amplify**.

The backend is an **Express** Node app deployed as an **AWS Lambda** function using **Serverless framework**. It connects to an **AWS DynamoDB** instance that is also configured through Serverless.

The app uses **AWS Cognito** (through Amplify) to handle authentication, for now.

We deploy using **GitHub Actions** for CI/CD.

## Development

You will need `npm` and Node installed, and also Java (for `serverless-dynamodb-local`)

Clone the code and navigate to the root of this repository. This script will install all npm packages for both the frontend
and backend, and it will globally install serverless and amplify-cli. It will also set up serverless's local DynamoDB.

```shell
./scripts/install.sh
```

### Run tests

We use jest for unit tests, on both the frontend. Run all tests with:

```shell
./scripts/test.sh
```

Run Cypress feature tests using: 

```shell
./scripts/feature-tests.sh
```

### Deploying

Use ship-it to run prettier, linting, and tests before pushing:

```shell
./scripts/ship-it.sh
```

The GitHub actions CI/CD (which is configured in `.github/development.yml`) will pick up the job and deploy to Amplify.

## Frontend deep-dive

The frontend code lives in `./web`.

When running locally, the `./scripts/start-web.sh` will execute `npm run dev` for local hot-refreshing of nextjs.
In production, we run `npm run build` which will execute `next build` and `next export`. This allows nextjs to build
all our pages and pre-render what it can. The export puts the final files in `./web/out` directory, which is served by Amplify.

This deployment process for Amplify is configured in `amplify/.config/project-config.json`.

### Styles

We depend on the compiled version of [NJ Web Design Standards](https://github.com/newjersey/njwds), which lives in `./web/public`
and pulls these styles into our code (configured via a line in `_app.tsx`). Ideally in the future, this would be a library to import
instead of a manual copying process.

### Environment variables

For Nextjs, environment variables are inserted at build time. In `./web/next.config.js`, the environment variables that the code 
will have access to are set up for the Next framework by pulling them in from the environment. This works because the system that is
building the Nextjs code (GitHub Actions workflow) has access to these variables via GitHub secrets during that build step.

**Important** - this means that any time you build the app, the system building it (your local terminal, say) needs to have these
environment variables set as well, or else they will not get set for the build app.

For jest testing, the value that will be used for the environment variables is set in `./web/setupTests.js`.

More environment variables are needed for Cypress feature tests than for actually running the app, since the Cypress tests
need access to AWS credentials to make Cognito API calls. These variables are expected by the feature test runner to exist in
a file called `./scripts/env.sh` which should not be checked into source control.

### Schemas

The `./web/schemas` folder holds the [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form) schema for our
onboarding form. The task `npm run make-schema-types` compiles this into a TypeScript type system for use in our code.

### Roadmaps

In the `./web/roadmaps` directory, we have JSON files containing the static content defining tasks and steps for different roadmaps.

### Static Rendering

We try to statically render the pages as much as possible, to take advantage of SEO.  Right now, the `/tasks/[taskId]` pages 
get their content through fully server-side rendering at build time. The methods used for static rendering are in `./web/lib/static` -
because they cannot be used for dynamic rendering.

The roadmap is not static, and is generated on-the-fly based on user data in the app.

### Authentication

Amazon Cognito has a way of tightly coupling itself to code dependencies, which is not great. It's somewhat isolated right now:
- `/signin` page uses the AWS Cognito components to render a sign-in page.
- `AuthButton` makes use of Cognito's sign-out feature
- `sessionHelper' is a wrapper around most Cognito Auth features.

For the rest of the app, we use our domain representation of authentication to abstract Cognito away from this:
- `AuthContext` provides the current user state to any component that requires it, and is the canonical representation of whether
the app is signed-in or signed-out.
- `signinHelper` is an abstraction of the business logic for what happens when a user signs in (redirects, etc) and should be 
triggered after auth actions regardless of authentication provider.
  
We also configure Cognito authentication programmatically in the Cypress `loginByCognitoApi` command.

### useSWR

We use the [useSWR](https://swr.vercel.app/) hook for handling userData fetching from the API. This is nice because it has a
built-in caching and revalidating system that fetches data when it needs to, and serves cached data when we don't need new data.
It acts as a form of state management for React, and any component that needs to access or update the `userData` state from
storage should make use of the `useUserData` wrapper around this hook.

## Backend deep-dive

The backend code lives in `./api`. It uses [serverless framework](https://www.serverless.com/) for handling the integration
with AWS Lambdas.

We use serverless to deploy. If you do this locally, your local serverless CLI needs to be configured with AWS credentials.

Locally, it uses `serverless-offline` and `serverless-dynamodb-local` to run and simulate the AWS environment.  Everything AWS and serverless is configured in `./api/serverless.ts`.

We use serverless to deploy an Express app. The app itself is defined in `src/functions/app.ts` and is mostly a regular Express app,
except it wraps its export in `serverless` to become a handler. Then, `src/functions/index.ts` defines the config structure that 
proxies all routes through to be handled by the Express routing system.

The rest of the code is regular hexagonal Express structure. the `src/api` folder contains route definitions, and depends on
abstractions and types defined in `src/domain`. The `src/db` folder contains the DynamoDB-specific logical implementation
of the interfaces in the domain. The top-level Express app is responsible for wiring the DynamoDB implementation into the router
or anything that has a DB dependency. We use [jest-dynalite](https://github.com/freshollie/jest-dynalite) as a testing helper to mock out DynamoDB for testing.

## Ports

|                    | local dev & CI feature tests | local feature tests | unit tests |
| -------------      | --------- | ------------- | ---------- |
| Nextjs frontend    | 3000      | 3001          |            |
| Serverless backend | 5000      | 5001          |            |
| DynamoDB           | 8000      | 8001          |            |
| Lambda port        | 5050      | 5051          |            |
| Dynalite local     |           |               | 8002       |
