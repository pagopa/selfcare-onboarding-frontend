import { Box } from '@mui/material';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';

export function Main() {
  const location = useLocation();
  const productId = location.pathname.replace(/^\/onboarding\/([^/]+)\/?.*/, '$1');
  return (
    <Box component="main" my="auto" marginY={11}>
      <Routes>
        {Object.values(ROUTES).map(({ PATH, PREFIX_MATCH, COMPONENT: Component }, i) => (
          <Route
            path={PREFIX_MATCH ? `${PATH}/*` : PATH}
            element={Component && <Component productId={productId} />}
            key={i}
          />
        ))}

        {/* Any deeper path under a product redirects to the product page */}
        <Route
          path={`${ROUTES.ONBOARDING_PRODUCT.PATH}/*`}
          element={
            <Navigate
              replace
              to={ROUTES.ONBOARDING_PRODUCT.PATH.replace(':productId', productId)}
            />
          }
        />

        <Route path="*" element={<Navigate replace to={ROUTES.ONBOARDING_ROOT.PATH} />} />
      </Routes>
    </Box>
  );
}
