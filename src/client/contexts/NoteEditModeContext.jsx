import { createContext, useState } from "react";

const NoteEditModeContext = createContext(null);

const NoteEditModeProvider = ({ children }) => {
  const [editMode, setEditMode] = useState(true);
  return (
    <NoteEditModeContext.Provider value={{ editMode, setEditMode }}>
      {children}
    </NoteEditModeContext.Provider>
  );
};

export { NoteEditModeContext, NoteEditModeProvider };
