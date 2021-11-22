import { useState } from 'react';
import { Party, User } from '../types';
import { BodyLogger } from './components/BodyLogger';
import { PartyContext, UserContext } from './lib/context';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [availableParties, setAvailableParties] = useState<Array<Party>>([]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <PartyContext.Provider value={{ party, availableParties, setParty, setAvailableParties }}>
        <BodyLogger />
      </PartyContext.Provider>
    </UserContext.Provider>
  );
}
