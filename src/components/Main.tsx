import { Box } from '@mui/material';
import { Redirect, Route, Switch } from 'react-router-dom';
import { BASE_ROUTE, ROUTES } from '../utils/constants';

export function Main() {
  return (
    <Box component="main" m={'auto 0'} pt={16}>
      <Switch>
        {Object.values(ROUTES).map(({ PATH, EXACT, COMPONENT: Component }, i) => (
          <Route path={PATH} exact={EXACT} key={i}>
            {Component && <Component />}
          </Route>
        ))}

        {/* If on the ROOT, redirect to platform or login page based on whether the user is logged in */}
        <Route path={BASE_ROUTE} exact={true}>
          <Redirect to={ROUTES.ONBOARDING.PATH} />
        </Route>

        <Route path="*">
          <Redirect to={ROUTES.ONBOARDING.PATH} />
        </Route>
      </Switch>
    </Box>
  );
}
