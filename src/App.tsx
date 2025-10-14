import { useState } from 'react';
import SessionModal from '@pagopa/selfcare-common-frontend/lib/components/SessionModal';
import { useTranslation } from 'react-i18next';
import { User } from '@pagopa/selfcare-common-frontend/lib/model/User';
import { BodyLogger } from './components/layout/BodyLogger';
import { UserContext } from './lib/context';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [requiredLogin, setRequiredLogin] = useState(false);
  const { t } = useTranslation();

  return (
    <UserContext.Provider value={{ user, setUser, requiredLogin, setRequiredLogin }}>
      <BodyLogger />
      <SessionModal
        handleClose={() => setRequiredLogin(false)}
        open={requiredLogin}
        title={t('app.sessionModal.title')}
        message={t('app.sessionModal.message')}
      />
    </UserContext.Provider>
  );
}
