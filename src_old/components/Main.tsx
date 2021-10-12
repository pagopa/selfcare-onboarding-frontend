import React, { useContext } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { BASE_ROUTE, ROUTES } from '../lib/constants';
import { UserContext } from '../lib/context';
import { NotFound } from '../views/NotFound';

export function Main() {
  const { user } = useContext(UserContext);

  return (
    <main>
      <Switch>
        {Object.values(ROUTES).map(({ PATH, EXACT, COMPONENT: Component }, i) => (
          <Route path={PATH} exact={EXACT} key={i}>
            {Component && <Component />}
          </Route>
        ))}

        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </main>
  );
}
