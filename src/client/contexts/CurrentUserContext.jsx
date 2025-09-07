import { createContext, useState, useEffect } from "react";

const CurrentUserContext = createContext(null);

const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem("currentUser");
    if (s)
      try {
        setCurrentUser(JSON.parse(s));
      } catch {
        localStorage.removeItem("currentUser");
      }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    currentUser
      ? localStorage.setItem("currentUser", JSON.stringify(currentUser))
      : localStorage.removeItem("currentUser");
  }, [currentUser]);

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, setCurrentUser, isLoading }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export { CurrentUserContext, CurrentUserProvider };
