# selfcare-onboarding-frontend

`selfcare-onboarding-frontend` is the [SelfCare](https://selfcare.pagopa.it/auth/login) onboarding flow which allows public administration and private individuals to subscribe to PagoPA products and access the reserved area.

## Prerequisites

- `Node.js 20` (see `.nvmrc`)
- `yarn 3`

## Frontend local development

1. **Install dependencies** (from the root folder):

```bash
yarn install
```

2. **Run the web app**:

```bash
yarn start
```

## Available scripts

| Command | Description |
|---|---|
| `yarn start` | Start the dev server |
| `yarn build` | Type-check and build for production |
| `yarn test` | Run unit tests with Vitest |
| `yarn test:coverage` | Run unit tests with coverage report |
| `yarn test:e2e:local` | Run E2E tests against a running local instance |
| `yarn test:e2e:local:full` | Start dev server and run E2E tests |
| `yarn lint` | Lint TypeScript/TSX files |
| `yarn lint-autofix` | Lint and auto-fix TypeScript/TSX files |
| `yarn prettify` | Format all TypeScript/TSX files with Prettier |

## Stack

- **Build tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI framework**: [React 18](https://react.dev/)
- **Base components**: [MUI Material-UI v5](https://mui.com/material-ui/)
- **PagoPA components**: [MUI Italia](https://main--633c31eff9fe385398ada426.chromatic.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/web)
- **HTTP client**: [Axios](https://axios-http.com)
- **Unit testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- **E2E testing**: [Playwright](https://playwright.dev/)
