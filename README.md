# navigator.business.nj.gov

This repository contains the [Business.NJ.Gov](https://business.nj.gov) public
landing site and its “My Account” application (formerly Navigator), maintained
by the New Jersey Innovation Authority. See [Business.NJ.Gov](#businessnjgov)
below for project history and partner credits.

[![GitHub Actions Build Status](https://github.com/newjersey/navigator.business.nj.gov/actions/workflows/build-and-test.yml/badge.svg?branch=main)](https://github.com/newjersey/navigator.business.nj.gov/actions/workflows/build-and-test.yml?query=branch%3Amain)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)
[![semantic-release](https://img.shields.io/badge/semantic-release-e10079.svg?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/newjersey/navigator.business.nj.gov)

## Architecture

The applications and shared packages are primarily written in TypeScript and run
on Node.js. The repository also includes Python scripts for development and
content tooling.

This repository is a pnpm workspace with three applications:

- [`api/`](api/) is an **Express** backend deployed as an **AWS Lambda**
  function using **AWS Cloud Development Kit**. It connects to an **AWS
  DynamoDB** instance that is also configured through **Terraform**.
- [`web/`](web/) is the My Account application, built with **React** and
  **Next.js** and deployed in Docker containers on **AWS Elastic Container
  Service**.
- [`packages/static-site/`](packages/static-site/README.md) is the
  Business.NJ.Gov public landing site, built with the Next.js App Router and
  localized content.

My Account uses **AWS Cognito** (through **AWS Amplify**) to handle
authentication for registered users. Unregistered users are able to browse the
site in guest mode without saving their data to the DynamoDB database.

We deploy using
**[GitHub Actions](https://github.com/newjersey/navigator.business.nj.gov/actions)**
for CI/CD.

## Development

You will need Node.js and the repository's pinned pnpm version installed for
primary development. Additionally, for running the server in local development
mode, you will need Python (for the AWS CLI and some of our scripts) installed
(details below).

We recommend using WSL2 if developing on Windows.

For pair programming, we recommend Visual Studio Code with the Live Share
extension.

### Software requirements

- [Node.js 24 "Krypton" LTS](https://nodejs.org/en/download/) (We recommend
  using [nvm](https://github.com/nvm-sh/nvm#readme) for managing Node.js
  versions.)
- [Docker CLI](https://www.docker.com/) — required for running containers
  locally
  - **macOS:** We recommend using [Colima](https://github.com/abiosoft/colima)
    as your Docker runtime
    - **Recommended Colima Configuration:** aarch64, cpu: 8, memory: 16, disk:
      256, runtime: docker
    - You can manually configure Colima with `colima start --edit` or the script
      `install.sh` will configure automatically.
  - **Windows (WSL2):** Use Docker Desktop with WSL2 integration enabled, or use
    native Docker CLI installed in a Linux-based WSL2 environment
  - **Linux:** Use the native Docker Engine installation
- [AWS CLI](https://aws.amazon.com/cli/)
- [Python 3.12+](https://www.python.org/downloads/) (managed automatically via
  [uv](https://docs.astral.sh/uv/))
- [pnpm](https://pnpm.io/installation)
- [wget](https://www.gnu.org/software/wget/)
- [Java JDK](https://www.oracle.com/java/technologies/downloads/)

**Windows (non-WSL) only**:

- [Visual Studio Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools)
  using "Visual C++ build tools" workload

### Pre-flight

You will then set up your AWS credentials. See
[Set up AWS CLI with SSO](https://newjersey.github.io/innovation-engineering/guides/development/aws-sso/)
for step by step guide.

SSO sessions expire. Run `aws sso login` to log back in.

Clone the code and navigate to the root of this repository. There is an
installation script that will install all required development tools and pnpm
packages, and execute a build.

If you are switching an existing checkout from Yarn, stale `node_modules`
directories can shadow pnpm's installed packages. Use a clean checkout, or move
the old root and workspace `node_modules` directories aside after reviewing
their contents before running the install script.

```shell
source scripts/install.sh
```

### Local env

Before you can run locally, you will need to:

- create a `./web/.env` that includes all the values laid out in the
  `./web/.env-template` file.
- create a `./api/.env` that includes all the values laid out in the
  `./api/.env-template` file.
- install [uv](https://docs.astral.sh/uv/) and set up the Python environment if
  working on Python helper scripts.
  1. **Install uv** (if you haven't already):

     ```shell
     # macOS (Homebrew)
     brew install uv

     # Linux / WSL (curl)
     curl -LsSf https://astral.sh/uv/install.sh | sh

     # Linux / WSL (wget)
     wget -qO- https://astral.sh/uv/install.sh | sh
     ```

  2. **(Optional) Enable shell completions for uv:**

     ```shell
     echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.zshrc
     source ~/.zshrc
     ```

  3. **Create the virtual environment** (uses the Python version pinned in
     `.python-version`):

     ```shell
     uv venv --managed-python .venv
     source .venv/bin/activate
     ```

  4. **Install dependencies:**

     ```shell
     uv sync
     ```
  - _Note: The application does not need a venv. This step is only required to
    run Python helper scripts._
  - To **update uv** itself: `uv self update`
  - To **upgrade all locked dependencies** to their latest compatible versions:
    `uv lock --upgrade`

- do an initial build (skip if you ran `install.sh`)

  ```shell
  pnpm run build
  ```

### Formatting and linting

Biome handles formatting and linting. Run `pnpm run lint` for the repository
checks, `pnpm run format:check` to check formatting only, or `pnpm run format`
to apply formatting.

### Run tests

We use Jest for TypeScript-based unit tests for the My Account application and
its supporting packages.

```shell
# Run the root Jest suite
pnpm run test

# Run a single unit test or file, rerunning if files change
pnpm run test <path to test file> -t "<part of test name>" --watch
```

We use Cypress for My Account end-to-end (e2e) testing. You can run these tests
locally as follows. Since some Cypress tests only run in the CI environment,
they require **running a local instance of the application** to test against.

```shell
# Terminal window 1
pnpm run start:dev
```

```shell
# Terminal window 2
./scripts/local-feature-tests.sh
```

Both unit and Cypress tests utilize random values in test setup. Should a test
fail, the random values used can be reproduced by finding the log output line
containing `RANDOM_SEED=`/`CYPRESS_RANDOM_SEED=` for the test that failed. Then,
run the test with the indicated environment variable, as in:

```shell
RANDOM_SEED=<random seed from failure log> pnpm run test <path to test file> -t "<part of test name>"
CYPRESS_RANDOM_SEED=<random seed from failure log> ./scripts/local-feature-tests.sh
```

To run all tests with code coverage:

```shell
pnpm run test:coverage
```

We use Python's `unittest` for our Python tests. Run all Python unit tests with:

```shell
pnpm run test:python
```

The public landing site uses Vitest and Playwright accessibility tests. See the
[static-site commands](packages/static-site/README.md#usage).

### Running locally

Before starting the app, make sure your Docker environment is running. This is
required for DynamoDB Local.

_Note:_ If you ran the `install.sh` script, you should have Colima installed and
running on your machine already. The script also sets Colima as a service for
Homebrew to start on machine login.

#### First-Time Setup

You will need to have all dependencies installed. If you haven't done so, you
can install all required technologies by running `source scripts/install.sh`
from the root directory.

1. Build the application

   ```shell
   pnpm run build # This happens in the install.sh script as well.
   ```

2. Launch all the services

   ```shell
   pnpm run start:dev
   ```

3. Open the My Account application in your browser. The frontend is available at
   [localhost:3000](http://localhost:3000)

4. Terminate the application with `Ctrl+C`. A cleanup script will tear down the
   Docker processes. If you need to stop the Docker containers manually, run:

   ```shell
   pnpm run services:down
   ```

To run the public landing site separately on port `4000`, follow the
[static-site development instructions](packages/static-site/README.md#usage).

### Deploying

Use `ship-it` to run formatting, linting, and tests before pushing:

```shell
./scripts/ship-it.sh
```

The GitHub CI/CD (which is configured in `.github/workflows`) will pick up the
job and deploy to the development environment for commits to the main branch.

## My Account frontend deep-dive

The frontend code lives in `./web`.

When running locally, `web/scripts/start-web.sh` executes `pnpm run dev` for
local hot-refreshing of Next.js. The `web` production build runs `next build`
and generates a sitemap. Next.js is configured for standalone output, which is
packaged into the My Account Docker image.

### Styles

We depend on the compiled version of
[Grove, the Garden State Design System](https://grove.nj.gov/), included via the
`@newjersey/njwds` package. Its styles are imported in `_app.tsx`.

### Environment variables

For Next.js, environment variables are inserted at build time. In
`./web/next.config.ts`, the environment variables that the code will have access
to are set up for the Next.js framework by pulling them in from the `.env` file.
This works because the system that is building the Next.js code (via GitHub
Actions workflow) has access to these variables via environment variables set
during that build step.

**Important**: This means that any time you build the app, the system building
it (your local terminal, for example) needs to have these environment variables
set as well, or else they will not get set for the build app.

For Jest testing, the value that will be used for the environment variables is
set in `./web/setupTests.js`.

For running (and testing) the app locally in development mode, it needs
environment variables locally as well. These should be provided via a
`./web/.env` file which should _never_ be checked into source control. There
exists a file `./web/.env-template` which provides a blank template to show what
variables should be included. This _is_ checked into source control and should
be updated any time new frontend variables are added.

### Roadmaps

In the `./content/src/roadmaps` directory, we have JSON files containing the
static content defining tasks and steps for different roadmaps. Each industry
has its own roadmap definition, located in `./content/src/roadmaps/industries`.

### Authentication

Amazon Cognito has a way of tightly coupling itself to code dependencies, which
is not great. It's somewhat isolated right now:

- `/signin` page uses the AWS Cognito components to render a sign-in page.
- `AuthButton` makes use of Cognito's sign-out feature
- `sessionHelper' is a wrapper around most Cognito Auth features.

For the rest of the app, we use our domain representation of authentication to
abstract Cognito away from this:

- `AuthContext` provides the current user state to any component that requires
  it, and is the canonical representation of whether the app is signed-in or
  signed-out.
- `signinHelper` is an abstraction of the business logic for what happens when a
  user signs in (redirects, etc) and should be triggered after auth actions
  regardless of authentication provider.

We also configure Cognito authentication programmatically in the Cypress
`loginByCognitoApi` command.

### useSWR

We use the [useSWR](https://swr.vercel.app/) hook for handling userData fetching
from the API. This is nice because it has a built-in caching and revalidating
system that fetches data when it needs to, and serves cached data when we don't
need new data. It acts as a form of state management for React, and any
component that needs to access or update the `userData` state from storage
should make use of the `useUserData` wrapper around this hook.

## Backend deep-dive

The backend code lives in `./api`. It uses
[AWS Cloud Development Kit (CDK)](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
for handling the integration with AWS Lambdas.

We use CDK to deploy the backend app. The backend app itself is defined in
`api/src/functions/express/app.ts` and is mostly a regular Express app, except
it wraps its export in `serverless-http` to become a handler. Locally, the
Express app runs normally. API gateway routing is configured using AWS CDK in
the `api/cdk/lib/apiStack.ts` file, which defines the config structure that
proxies all routes through to be handled by the Express routing system.

The rest of the code is regular hexagonal Express structure. The `src/api`
folder contains route definitions and depends on abstractions and types defined
in `src/domain`. The `src/db` folder contains the DynamoDB-specific logical
implementation of the interfaces in the domain. The top-level Express app is
responsible for wiring the DynamoDB implementation into the router or anything
that has a database dependency. We use
[jest-dynalite](https://github.com/freshollie/jest-dynalite) as a testing helper
to mock out DynamoDB for testing.

### Database schema and migrations

DynamoDB isn't strongly schema'd, but we do expect objects of a certain
structure to be returned to the frontend when we request user data. Sometimes
we'll be changing the data structure and we need the database to be able to
account for and understand this.

We solve this by using **document versioning** and running **migrations** on
individual documents as we retrieve them from storage. The documents are stored
with a schema version number (which is stripped before sending to the frontend).
On a `GET` request for a document, if its version is out-of-date with the most
recent, we run a series of migrations on it to map the data to the current
structure. We then save that new document in the current version, and return it
to the frontend.

Reasons for this approach:

- zero-downtime for the database anytime we change document schema
- managed only in code, no need to handle AWS lambdas and streams to make a
  migration happen

Notes about this approach:

- in the database itself, various documents will be structured differently, as
  they will only be migrated when they are accessed. This isn't a concern if the
  documents are only ever accessed through the DB client layer, which performs
  the migrations as it accesses them

#### Adding a new migration

If you want to change the structure of the `UserData` object, there is a helper
script that creates and updates most of the relevant code at
`./scripts/generate-new-migration.sh`. It takes the following actions:

1. **Creates a new file** in `./api/src/db/migrations` and names it
   `v{X}_{migration_description}.ts` where `{X}` is replaced by the next
   successive version and `{migration_description}` is a snake-cased name
   describing the data being changed in the migration.
   The`{migration_description}` is prompted by the script and input by the user
   when running `generate-new-migration.sh`.

2. **Creates a new type** in the file and names it `v{X}UserData`, which defines
   the new structure of your new `UserData` type.

3. **Creates a migration function** in the file with type signature
   `(v{X-1}UserData) => v{X}UserData`, which defines the way that the previous
   version of the object should be mapped to the new structure.
   - **Note:** `generate-new-migration.sh` currently only copies the previous
     migration function. _You must write your own updated migration function_.
     You should also test it to verify transformations are executed properly.

4. **Adds the migration function to the list** of functions in
   `./api/src/db/migrations/migrations.ts`. This array should be ordered by
   ascending version number.

5. **Changes the types** in `types.ts` for `UserData` (and `factories` and
   anywhere else needed) to reflect the newest version of the type to the rest
   of the code.

## Ports

| service            | local dev & CI feature tests | local feature tests | unit tests |
| ------------------ | ---------------------------- | ------------------- | ---------- |
| Next.js frontend   | 3000                         | 3001                |            |
| CDK backend        | 5002                         | 5001                |            |
| DynamoDB           | 8000                         | 8001                |            |
| DynamoDB Admin GUI | 8001                         | 8001                |            |
| Lambda port        | 5050                         | 5051                |            |
| Dynalite local     |                              |                     | 8002       |

## Business.NJ.Gov

[Business.NJ.Gov](https://business.nj.gov) is being developed by the
[New Jersey Innovation Authority](https://innovation.nj.gov),
[New Jersey Department of State's Business Action Center](https://www.nj.gov/state/bac/),
and the [New Jersey Economic Development Authority](https://www.njeda.gov) with
support from departments and agencies across the State.

Business.NJ.Gov began under Governor Phil Murphy's _Business First Stop_
initiative. It helps entrepreneurs and business owners find the information,
resources, and services they need to start, operate, and grow a business in New
Jersey. We continue to improve the site and its services based on feedback from
businesses across the state, and we include a live chat feature to collect that
feedback along with an interactive feedback widget. To register your interest
for user testing and feedback sessions, use one of these tools to get in touch.

### Built as open source

Business.NJ.Gov is an open source project that is meant to serve as a base for
anyone who is looking to create an online resource for their own business
community. The software code in this repository is licensed under the
[MIT License](./LICENSE). Content (text, data, and other non-code assets) is
separately licensed — you can find those details at
[Business.NJ.Gov/license](https://business.nj.gov/license).

#### Disclaimer

This project utilizes certain tools and technologies for development purposes.
The inclusion of these tools does not imply endorsement or recommendation. Users
are encouraged to evaluate the suitability of these tools for their own use.

### Thank you

Business.NJ.Gov is made possible by building on the work and creativity of the
Cities of San Francisco and Los Angeles as well as their technology partners,
whose Business Portal content and code base served as a foundation for the site.

### Suggestions, feedback, and contributions

Please reach out or leave feedback for us through the interactive live chat
feature on [Business.NJ.Gov](https://business.nj.gov). You can also open a
GitHub pull request or issue. If you want to get in touch with the New Jersey
Innovation Authority team, please email us at
[team@innovation.nj.gov](mailto:team@innovation.nj.gov).

For development and review standards, see [Contributing](CONTRIBUTING.MD) and
[agent guidance](AGENTS.md).

### Join the New Jersey Innovation Authority

If you are excited to design and deliver modern policies and services to improve
the lives of all New Jerseyans, you should
[join us](https://innovation.nj.gov/join)!
