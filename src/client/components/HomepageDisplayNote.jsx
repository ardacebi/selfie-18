import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { marked } from "marked";
import { ThemeContext } from "../contexts/ThemeContext";
import commonStyles from "../styles/commonStyles.js";

export const HomepageDisplayNote = ({ noteData, isMobile }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const { theme } = useContext(ThemeContext);
  const HTMLbody = marked.parse(noteData.body);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        navigate(`/notes`);
      }}
      style={{
        ...commonStyles.notes.noteItem(theme),
        margin: "0 auto",
        width: isMobile ? "100%" : "500px",
        textAlign: "left",
        ...(hovered ? commonStyles.notes.noteItemHover : {}),
      }}
    >
      <div
        style={{
          ...commonStyles.notes.noteContent,
        }}
      >
        <div>
          <h2 style={{ wordWrap: "break-word", wordBreak: "break-word" }}>
            {noteData.title}
          </h2>
          {
            <p style={commonStyles.notes.notesDate(theme)}>
              Created on: {new Date(noteData.creationDate).toLocaleDateString()}{" "}
              | Last modified:{" "}
              {new Date(noteData.lastModifiedDate).toLocaleDateString()}
            </p>
          }
          <div
            style={{ wordWrap: "break-word", wordBreak: "break-word" }}
            dangerouslySetInnerHTML={{
              __html:
                HTMLbody.length > 200
                  ? HTMLbody.substring(0, 200) + "..."
                  : HTMLbody,
            }}
          />
        </div>
      </div>
    </div>
  );
};
