import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { User } from '@/types';
import { echo } from '@laravel/echo-react';

type OnlineUsersContextType = {
  onlineUsers: User[];
};

const OnlineUsersContext = createContext<OnlineUsersContextType>({ onlineUsers: [] });

export const OnlineUsersProvider: React.FC<PropsWithChildren<object>> = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useEffect(() => {
    // Only setup presence channel if Echo is configured
    try {
      const echoInstance = echo();
      if (!echoInstance) {
        console.warn('Echo not configured, online users feature disabled');
        return;
      }

      echoInstance.join('users')
        .here((users: User[]) => setOnlineUsers(users))
        .joining((user: User) => setOnlineUsers(prev => [...prev, user]))
        .leaving((user: User) => setOnlineUsers(prev => prev.filter(u => u.id !== user.id)))
        .error((error: unknown) => console.error('Echo error:', error));

      return () => {
        echoInstance.leave('users');
      };
    } catch (error) {
      console.warn('Echo not available:', error);
      return;
    }
  }, []);

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers }}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export const useOnlineUsers = () => useContext(OnlineUsersContext);
