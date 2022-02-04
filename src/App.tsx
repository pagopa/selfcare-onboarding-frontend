import { useState } from 'react';
import SessionModal from '@pagopa/selfcare-common-frontend/components/SessionModal';
import { User } from '../types';
import { BodyLogger } from './components/BodyLogger';
import { UserContext } from './lib/context';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [requiredLogin, setRequiredLogin] = useState(false);

  return (
    <UserContext.Provider value={{ user, setUser, requiredLogin, setRequiredLogin }}>
      <BodyLogger />
      <SessionModal
        handleClose={() => setRequiredLogin(false)}
        open={requiredLogin}
        title="Sessione scaduta"
        message="Stai per essere rediretto alla pagina di login..."
      />
    </UserContext.Provider>
  );
}
