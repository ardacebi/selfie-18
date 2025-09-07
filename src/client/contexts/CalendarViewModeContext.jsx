import { createContext, useState } from "react";

const CalendarViewModeContext = createContext(null);

const CalendarViewModeProvider = ({ children }) => {
  const [calendarViewMode, setCalendarViewMode] = useState("events");
  return (
    <CalendarViewModeContext.Provider
      value={{ calendarViewMode, setCalendarViewMode }}
    >
      {children}
    </CalendarViewModeContext.Provider>
  );
};

export { CalendarViewModeContext, CalendarViewModeProvider };
