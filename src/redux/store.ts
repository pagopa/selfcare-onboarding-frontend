import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { appStateReducer } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { userReducer } from '@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice';

const LOG_REDUX_ACTIONS = process.env.NODE_ENV === 'development';

const additionalMiddlewares = LOG_REDUX_ACTIONS ? [logger] : [];

export const createStore = () =>
  configureStore({
    reducer: {
      user: userReducer,
      appState: appStateReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(additionalMiddlewares),
  });

export const store = createStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
