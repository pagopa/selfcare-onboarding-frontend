import { useState } from 'react';
import { User } from '../types';
import { BodyLogger } from './components/BodyLogger';
import { UserContext } from './lib/context';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BodyLogger />
    </UserContext.Provider>
  );
}
