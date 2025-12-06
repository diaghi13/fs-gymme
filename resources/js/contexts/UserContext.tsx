import React, { createContext, useContext, ReactNode } from 'react';

type Permission = { name: string };
type Role = { name: string; permissions?: Permission[] };
type User = {
  roles?: Role[];
  permissions?: Permission[];
};

type UserContextType = {
  user?: User;
  setUser: (user: User) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children, user }: { children: ReactNode; user?: User }) => {
  const [currentUser, setCurrentUser] = React.useState<User | undefined>(user);

  return (
    <UserContext.Provider value={{ user: currentUser, setUser: setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser deve essere usato all\'interno di UserProvider');
  }
  return context;
};
