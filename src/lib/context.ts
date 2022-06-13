import { createContext } from 'react';
import { User } from '../../types';

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  requiredLogin: boolean;
  setRequiredLogin: React.Dispatch<React.SetStateAction<boolean>>;
};

export const UserContext = createContext({
  user: null,
  setUser: () => {},
  requiredLogin: false,
  setRequiredLogin: () => {},
} as UserContextType);

type HeaderContextType = {
  enableLogin: boolean;
  setEnableLogin: (enableLogin: boolean) => void;
  subHeaderVisible: boolean;
  setSubHeaderVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onExit: ((exitAction: () => void) => void) | undefined;
  setOnExit: React.Dispatch<React.SetStateAction<((exitAction: () => void) => void) | undefined>>;
};

export const HeaderContext = createContext({
  enableLogin: true,
  setEnableLogin: () => {},
  subHeaderVisible: true,
  setSubHeaderVisible: () => {},
  onExit: undefined,
  setOnExit: () => {},
} as HeaderContextType);
