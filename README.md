# Business.NJ.Gov Dashboardz

This is the development repository for the work-in-progress business dashboard from the New Jersey Office of Innovation. For info on the existing [Business.NJ.gov](https://business.nj.gov) site, please see the [bottom of this document](https://github.com/newjersey/business.nj.gov#businessnjgov)

[![CircleCI](https://circleci.com/gh/newjersey/business.nj.gov/tree/main.svg?style=svg)](https://circleci.com/gh/newjersey/business.nj.gov/tree/main)
[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

## Architecture

Everything is **TypeScript**.

The frontend is **React** with **next.js**, deployed on **AWS Amplify**.

The backend is an **Express** Node app deployed as an **AWS Lambda** function using **Serverless framework**. It connects to an **AWS DynamoDB** instance that is also configured through Serverless.

The app uses **AWS Cognito** (through Amplify) to handle authentication, for now.

We deploy using **GitHub Actions** for CI/CD.

## Development

You will need `npm` and Node installed, and also Java (for `serverless-dynamodb-local`)

### Software Requirement
- [Node 14](https://nodejs.org/en/download/)
- [Java 16 JDK](https://www.oracle.com/java/technologies/javase-jdk16-downloads.html)
- [Python 3.9](https://www.python.org/downloads/)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools) using "Visual C++ build tools" workload - **Windows Only**

Clone the code and navigate to the root of this repository. Running **npm install** at the root will install all npm packages for both the frontend
and backend. It will also set up serverless's local DynamoDB.

```shell
npm install
```

In order for the web frontend tests to pass and for it to be able to run locally, it **needs to have Amplify locally configured** such that the `web/aws-exports.js` file exists. This can be done by running and using the project's Amplify AWS credentials when prompted. These commands should be run from the root of the project.

```shell
aws configure
```

```shell
amplify init
```

Additionally, serverless needs to be configured with our AWS account. Run this with our AWS access credentials:

```shell
sls config credentials -- --provider aws --key AWS_KEY --secret AWS_SECRET_KEY
```

### Local env

Before you can run locally, you will need to:
- create a `web/.env` that includes all the values laid out in the `web/.env-template` file.
- create a `api/.env` that includes all the values laid out in the `api/.env-template` file.

### Run tests

We use jest for unit tests, on both the frontend. Run all tests with:

```shell
./scripts/test.sh
```

Run Cypress feature tests using: 

```shell
./scripts/feature-tests.sh
```

### Running locally

Start the backend:
```shell
npm --prefix=api run start
```

Start the frontend

```shell
npm --prefix=web run dev
```

Start wiremock (for mocking external dependencies locally)

```shell
npm --prefix=api run start:wiremock
```


### Deploying

Use ship-it to run prettier, linting, and tests before pushing:

```shell
./scripts/ship-it.sh
```

The GitHub actions CI/CD (which is configured in `.github/workflows/pipeline.yml`) will pick up the job and deploy to Amplify for commits to the main branch.

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

For Nextjs, environment variables are inserted at build time. In `./web/next.config.js`, the environment variables that the code will have access to are set up for the Next framework by pulling them in from the environment. This works because the system that is building the Nextjs code (GitHub Actions workflow) has access to these variables via GitHub secrets during that build step.

**Important** - this means that any time you build the app, the system building it (your local terminal, say) needs to have these environment variables set as well, or else they will not get set for the build app.

For jest testing, the value that will be used for the environment variables is set in `./web/setupTests.js`.

For running (and testing) the app locally in development mode, it needs environment variables locally as well. These should be provided via a `web/.env` file which should *not* be checked into source control. There exists a file `web/.env-template` which provides a blank template to show what variables should be included. This *is* checked into source control and should be updated any time new frontend variables are added.

### UI Display Content

The `./web/display-content` folder holds files that define the user text for:
- `IndustryLookup.ts` - how industry names are displayed
- `LegalStructureLookup.ts` - how legal structure names are displayed   

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

We use serverless to deploy an Express app. The app itself is defined in `src/functions/migrate.ts` and is mostly a regular Express app,
except it wraps its export in `serverless` to become a handler. Then, `src/functions/index.ts` defines the config structure that 
proxies all routes through to be handled by the Express routing system.

The rest of the code is regular hexagonal Express structure. the `src/api` folder contains route definitions, and depends on
abstractions and types defined in `src/domain`. The `src/db` folder contains the DynamoDB-specific logical implementation
of the interfaces in the domain. The top-level Express app is responsible for wiring the DynamoDB implementation into the router
or anything that has a DB dependency. We use [jest-dynalite](https://github.com/freshollie/jest-dynalite) as a testing helper to mock out DynamoDB for testing.

### Database schema & migrations

DynamoDB isn't strongly schema'd, but we do expect objects of a certain structure to be returned to the frontend when we request user data. Sometimes we'll be changing the data structure and we need the database to be able to account for and understand this.

We solve this by using **document versioning** and running **migrations** on individual documents as we retrieve them from storage. The documents are stored with a schema version number (which is stripped before sending to the frontend). On a get request for a document, if its version is out-of-date with the most recent, we run a series of migrations on it to map the data to the current structure. We then save that new document in the current version, and return it to the frontend.

Reasons for this approach:
- zero-downtime for the database anytime we change document schema
- managed only in code, no need to handle AWS lambdas and streams to make a migration happen

Notes about this approach:
- in the database itself, various documents will be structured differently, as they will only be migrated when they are accessed. This isn't a concern if the documents are only ever accessed through the DB client layer, which performs the migrations as it accesses them

#### Adding a new migration

If you want to change the structure of the `UserData` object, here's how:

1. **Create a new file** in `api/src/db/migrations` and name it `v{X}_descriptionHere.ts` where `{X}` is replaced by the next successive version.

2. **Create a new type** in the file and name it `v{X}UserData` that defines the new structure of your new UserData type

3. **Create a migration function** in the file with type signature `(v{X-1}UserData) => v{X}UserData` and in here, define the way that the previous version of the object should be mapped to the new structure. Test it.

4. **Add the migration function to the list** of functions in `api/src/db/migrations/migrations.ts`. Make sure it's in order at its proper index. Do **NOT** skip versions because the index of this array must match the index that it is migrating from. ie, `migrate_v4_to_v5` must be at index 4 of this array.

5. **Change the types** in `types.ts` for `UserData` (and `factories` and anywhere else needed) to reflect the newest version of the type to the rest of the code.

## Ports

|                    | local dev & CI feature tests | local feature tests | unit tests |
| -------------      | --------- | ------------- | ---------- |
| Nextjs frontend    | 3000      | 3001          |            |
| Serverless backend | 5000      | 5001          |            |
| DynamoDB           | 8000      | 8001          |            |
| Lambda port        | 5050      | 5051          |            |
| Dynalite local     |           |               | 8002       |

## Business.NJ.Gov

[Business.NJ.gov](https://business.nj.gov) is being developed by the Office of Innovation, Department of State's Business Action Center and the Economic Development Authority with support from Departments and Agencies across the State.

This site and the Governor's Business First Stop initiative are intended to simplify and streamline access to the information, resources, and services that aspiring entrepreneurs and business owners need to start, operate, and grow their business in the Garden State.

We are launching Business.NJ.gov in beta and using real-time user input to iteratively improve the site and services. The site is also being developed with the support and input of business communities throughout the State.

### Built as Open Source

Business.NJ.gov is an open source project that is meant to serve as a base for anyone who is looking to create an online resource for their own business community. You can find full license details at [Business.NJ.gov/license](https://business.nj.gov/license).

### Launch a copy of the website

We manage the website through Webflow. To launch your own copy of the site, visit the Webflow showcase and click "Open in Webflow": https://webflow.com/website/State-of-NJ-Business-One-Stop

### Repositories and Code

A static export of the Business.NJ.gov website source code can be found at the [NewJersey/open-business-portal Github Repository](https://github.com/newjersey/open-business-portal).

### Thank You

Business.NJ.gov is made possible by building on the work and creativity of the Cities of San Francisco and Los Angeles as well as their technology partners, whose Business Portal content and code base served as a foundation for the site.

### Suggestions, Feedback and Contributions

Please reach out or leave feedback for us at [Business.NJ.gov/feedback](https://business.nj.gov/feedback). You can also open a Github pull request or issue. If you want to get in touch with the Office of Innovation team, please email us at team@innovation.nj.gov.


### Join the Office of Innovation!

If you are excited to design and deliver modern policies and services to improve the lives of all New Jerseyans, you should [join us](https://innovation.nj.gov/join.html)!
