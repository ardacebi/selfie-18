import { createContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

const ThemeProvider = ({ children }) => {
  const sys = () =>
    window?.matchMedia?.("(prefers-color-scheme: dark)")?.matches
      ? "dark"
      : "light";
  const [theme, setTheme] = useState(() =>
    typeof window === "undefined"
      ? "light"
      : localStorage.getItem("theme") || sys(),
  );
  const [isSystemTheme, setIsSystemTheme] = useState(() =>
    typeof window === "undefined" ? true : !localStorage.getItem("theme"),
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const cur = saved || sys();
    setTheme((t) => (t === cur ? t : cur));
    setIsSystemTheme(!saved);
  }, []);

  useEffect(() => {
    document?.documentElement?.classList.remove("dark-theme", "light-theme");
    document?.documentElement?.classList.add(
      theme === "dark" ? "dark-theme" : "light-theme",
    );
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = () => isSystemTheme && setTheme(sys());
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [isSystemTheme]);

  useEffect(() => {
    isSystemTheme
      ? localStorage.removeItem("theme")
      : localStorage.setItem("theme", theme);
  }, [theme, isSystemTheme]);

  const toggleTheme = () => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 600);
    setIsSystemTheme(false);
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const resetToSystemTheme = () => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 600);
    setIsSystemTheme(true);
    localStorage.removeItem("theme");
    setTheme(sys());
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isSystemTheme,
        resetToSystemTheme,
        isTransitioning,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
