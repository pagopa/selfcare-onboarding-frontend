import '@pagopa/selfcare-common-frontend/lib/common-polyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
// import '@pagopa/selfcare-common-frontend/lib/index.css';
import { BrowserRouter } from 'react-router-dom';
import { CONFIG } from '@pagopa/selfcare-common-frontend/lib/config/env';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia';
import { Provider } from 'react-redux';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MOCK_USER } from './utils/constants';
import { ENV } from './utils/env';
import './consentAndAnalyticsConfiguration.ts';
import './locale';
import './index.css';
import { store } from './redux/store';

// eslint-disable-next-line functional/immutable-data
CONFIG.MOCKS.MOCK_USER = MOCK_USER;
// eslint-disable-next-line functional/immutable-data
CONFIG.URL_FE.LOGIN = `${ENV.URL_FE.LOGIN}`;
// eslint-disable-next-line functional/immutable-data
CONFIG.URL_FE.LOGOUT = ENV.URL_FE.LOGOUT;
// eslint-disable-next-line functional/immutable-data
CONFIG.URL_FE.ASSISTANCE = ENV.URL_FE.ASSISTANCE;

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
