import { render } from '@testing-library/react';
import React, { useState } from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { User } from '../../types';
import { HeaderContext, UserContext } from './../lib/context';
import { ENV } from './env';

export const renderComponentWithProviders = (
  component: React.ReactElement,
  productId: string = 'prod-pn',
  injectedHistory?: ReturnType<typeof createMemoryHistory>
) => {
  const Component = () => {
    const [user, setUser] = useState<User | null>(null);
    const [subHeaderVisible, setSubHeaderVisible] = useState<boolean>(false);
    const [onExit, setOnExit] = useState<(exitAction: () => void) => void | undefined>();
    const [enableLogin, setEnableLogin] = useState<boolean>(true);
    const history = injectedHistory ? injectedHistory : createMemoryHistory();

    return (
      <HeaderContext.Provider
        value={{
          subHeaderVisible,
          setSubHeaderVisible,
          onExit,
          setOnExit,
          enableLogin,
          setEnableLogin,
        }}
      >
        <UserContext.Provider
          value={{ user, setUser, requiredLogin: false, setRequiredLogin: () => {} }}
        >
          <button onClick={() => onExit?.(() => window.location.assign(ENV.URL_FE.LOGOUT))}>
            LOGOUT
          </button>
          <Router history={history}>
            {React.createElement(component.type, { ...component.props, productId })}
          </Router>
        </UserContext.Provider>
      </HeaderContext.Provider>
    );
  };

  render(<Component />);
};
