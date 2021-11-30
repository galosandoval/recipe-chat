import { createContext, useState } from "react";

const initialUserState = { id: 0, auth: false };

export const UserContext = createContext(initialUserState);

export const UserProvider = ({ children }) => {
  const [user, setUserId] = useState(initialUserState);

  const login = (id) => {
    setUserId({ id, auth: true });
  };

  const logout = () => {
    setUserId(initialUserState);
  };

  return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>;
};
