import { createContext, useState, useEffect } from "react";

const CurrentDateContext = createContext(null);

const CurrentDateProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [manualControl, setManualControl] = useState(false);

  const [isTimeStopped, setIsTimeStopped] = useState(false);

  useEffect(() => {
    if (!manualControl && !isTimeStopped) {
      const timerGlobal = setInterval(() => {
        setCurrentDate(new Date());
      }, 1000); // Update every second

      return () => clearInterval(timerGlobal);
    }
  }, [manualControl, isTimeStopped]);

  useEffect(() => {
    if (manualControl && !isTimeStopped) {
      const timerGlobal = setInterval(() => {
        setCurrentDate((prevDate) => new Date(prevDate.getTime() + 1000));
      }, 1000); // Update every second

      return () => clearInterval(timerGlobal);
    }
  }, [manualControl, isTimeStopped]);

  return (
    <CurrentDateContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        manualControl,
        setManualControl,
        isTimeStopped,
        setIsTimeStopped,
      }}
    >
      {children}
    </CurrentDateContext.Provider>
  );
};

export { CurrentDateContext, CurrentDateProvider };
