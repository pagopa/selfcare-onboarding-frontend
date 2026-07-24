import '@pagopa/selfcare-common-frontend/lib/common-polyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
// import '@pagopa/selfcare-common-frontend/lib/index.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './consentAndAnalyticsConfiguration';
import './index.css';
import './locale';
import { store } from './redux/store';
import reportWebVitals from './reportWebVitals';
import { MOCK_USER, PRODUCT_IDS } from './utils/constants';
import { ENV } from './utils/env';
import { buildLoginUrl } from './utils/unloadEvent-utils';

// eslint-disable-next-line functional/immutable-data
CONFIG.MOCKS.MOCK_USER = MOCK_USER;
// eslint-disable-next-line functional/immutable-data
CONFIG.URL_FE.LOGIN = buildLoginUrl();
// eslint-disable-next-line functional/immutable-data
CONFIG.URL_FE.LOGOUT = ENV.URL_FE.LOGOUT;
// eslint-disable-next-line functional/immutable-data
CONFIG.URL_FE.ASSISTANCE = window.location.pathname?.includes(PRODUCT_IDS.IDPAY_MERCHANT)
  ? `${ENV.URL_FE.ASSISTANCE}?productId=${PRODUCT_IDS.IDPAY_MERCHANT}`
  : ENV.URL_FE.ASSISTANCE;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const AppTree = (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
);
root.render(
  import.meta.env.DEV ? AppTree : <React.StrictMode>{AppTree}</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
