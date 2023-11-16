# selfcare-onboarding-frontend

[![Code Review](https://dev.azure.com/pagopaspa/selfcare-platform-app-projects/_build)

`selfcare-onboarding-frontend` is the [SelfCare](https://selfcare.pagopa.it/auth/login) onboarding flow which allows public administration and private individuals to subscribe to PagoPA products and access the reserved area.

## Prerequisites

In order to run the `selfcare-onboarding-frontend` front-end locally you need the following tool installed on your machine.

- `Node.js 16`
- `yarn 3`

## Frontend local development

To test the `webapp` locally:

1. **Install the project (if you haven't already).** Run from the root folder the following commands.

```bash
# to install the dependencies
yarn install

2. **Run the Web App**. Run (from the root folder) the following command

```bash
yarn start
```

General informations

# Stack
- template: [Create React App](https://github.com/facebook/create-react-app), [template with TypeScript](https://create-react-app.dev/docs/adding-typescript/)
- Base components: [MUI Material-UI](https://mui.com/material-ui/)
- Specifical components: [MUI Italia (library created by PagoPA)](https://main--633c31eff9fe385398ada426.chromatic.com/)
- Routing: [React Router DOM](https://reactrouter.com/web)
- API Call: [Axios](https://axios-http.com)