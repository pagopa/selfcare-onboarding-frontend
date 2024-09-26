import { Box } from '@mui/material';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useLocation } from 'react-router';
import { ROUTES } from '../utils/constants';

export function Main() {
  const location = useLocation();
  const productId = location.pathname.replace(/^\/onboarding\/([^/]+)\/?.*/, '$1');
  return (
    <Box component="main" my="auto" marginY={11}>
      <Switch>
        {Object.values(ROUTES).map(({ PATH, EXACT, COMPONENT: Component }, i) => (
          <Route path={PATH} exact={EXACT} key={i}>
            {Component && <Component productId={productId} />}
          </Route>
        ))}

        {/* If on the ROOT, redirect to platform or login page based on whether the user is logged in */}
        <Route path={ROUTES.ONBOARDING_PRODUCT.PATH} exact={false}>
          <Redirect to={ROUTES.ONBOARDING_PRODUCT.PATH.replace(':productId', productId)} />
        </Route>

        <Route path="*">
          <Redirect to={ROUTES.ONBOARDING_ROOT.PATH} />
        </Route>
      </Switch>
    </Box>
  );
}
