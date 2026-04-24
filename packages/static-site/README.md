# Static Site Workspace (`@businessnjgovnavigator/static-site`)

This package contains the locale-aware static landing site implementation for Business.NJ.gov. It
uses the Next.js App Router, renders NJWDS-based page sections through typed React components, and
loads localized content from validated message files.

## Table of Contents

1. [Architecture](#architecture)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Contributing](#contributing)
5. [License](#license)
6. [Contact](#contact)
7. [Acknowledgements](#acknowledgements)

## Architecture

The static-site workspace is organized around a locale-prefixed route shell (`app/[locale]`) and a
typed content pipeline.

- Route handling and metadata generation happen in `app/[locale]/layout.tsx` and
  `app/[locale]/page.tsx`.
- Locale middleware is configured in `proxy.ts` using `next-intl`.
- Locale definitions and navigation helpers live in `domain/i18n/*`.
- Localized message payloads are stored in `messages/*.json` and validated in
  `domain/i18n/messages.ts`.
- Landing page content is loaded through `domain/landing/loadLandingContent.ts`.
- Stateless presentation components are implemented in `components/landing/*`.
- Accessibility checks run in `tests/accessibility/*` with Playwright and axe-core.

### Built With

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [next-intl](https://next-intl.dev/)
- [NJWDS (`@newjersey/njwds`)](https://www.npmjs.com/package/@newjersey/njwds)
- [TypeScript](https://www.typescriptlang.org/)
- [Biome](https://biomejs.dev/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [axe-core](https://www.deque.com/axe/core-documentation/)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)

## Installation

Install from the repository root.

```bash
# Clone this repository
git clone https://github.com/newjersey/navigator.business.nj.gov.git

# Go into the repository
cd navigator.business.nj.gov

# Use the repo's Node.js version (24.12.0)
. scripts/install.sh
```

## Usage

Run commands from the repository root with the static-site workspace target.

```bash
# Start local dev server
yarn workspace @businessnjgovnavigator/static-site dev

# Create production build
yarn workspace @businessnjgovnavigator/static-site build

# Start production server
yarn workspace @businessnjgovnavigator/static-site start

# Lint and formatting checks
yarn workspace @businessnjgovnavigator/static-site lint
yarn workspace @businessnjgovnavigator/static-site format:check

# Typecheck
yarn workspace @businessnjgovnavigator/static-site typecheck

# Unit/component tests
yarn workspace @businessnjgovnavigator/static-site test

# Browser accessibility tests
yarn workspace @businessnjgovnavigator/static-site test:accessibility
```

## Contributing

Contributions are welcome and appreciated.

Before opening a pull request for this workspace, run:

1. `yarn workspace @businessnjgovnavigator/static-site lint`
2. `yarn workspace @businessnjgovnavigator/static-site typecheck`
3. `yarn workspace @businessnjgovnavigator/static-site test`
4. `yarn workspace @businessnjgovnavigator/static-site build`
5. `yarn workspace @businessnjgovnavigator/static-site test:accessibility`

Then submit changes through the standard workflow:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT license. For more information, see
[LICENSE](../../LICENSE.md).

## Contact

If you want to get in touch with the New Jersey Innovation Authority team, please email us at
[team@innovation.nj.gov](mailto:team@innovation.nj.gov).

### Join the New Jersey Innovation Authority!

If you are excited to design and deliver modern policies and services to improve the lives of all
New Jerseyans, you should
[join the New Jersey Innovation Authority](https://innovation.nj.gov/join.html)!

## Disclaimer

This project utilizes certain tools and technologies for development purposes. The inclusion of
these tools does not imply endorsement or recommendation. Users are encouraged to evaluate the
suitability of these tools for their own use.
