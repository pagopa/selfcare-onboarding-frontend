import { createContext } from 'react';
import { Party, User } from '../../types';

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const UserContext = createContext({ user: null, setUser: () => {} } as UserContextType);

type HeaderContextType = {
  subHeaderVisible  : boolean;
  setSubHeaderVisible : React.Dispatch<React.SetStateAction<boolean>>;
  onLogout : (() => void) | null | undefined;
  setOnLogout: React.Dispatch<React.SetStateAction<(() => void) | null | undefined>>;
};

export const HeaderContext = createContext({ 
  subHeaderVisible: true , 
  setSubHeaderVisible: () => {}, 
  onLogout: () => {}, 
  setOnLogout: () => {} 
} as HeaderContextType);


type PartyContextType = {
  party: Party | null;
  availableParties: Array<Party>;
  setParty: React.Dispatch<React.SetStateAction<Party | null>>;
  setAvailableParties: React.Dispatch<React.SetStateAction<Array<Party>>>;
};

export const PartyContext = createContext({
  party: null,
  availableParties: [],
  setParty: () => {},
  setAvailableParties: () => {},
} as PartyContextType);
