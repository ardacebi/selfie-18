import { useContext, useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import fetchNoteData from "../data_fetching/fetchNoteData";
import patchNoteData from "../data_creation/patchNoteData";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { CurrentDateContext } from "../contexts/CurrentDateContext";
import { marked } from "marked";
import { ThemeContext } from "../contexts/ThemeContext";
import { NoteEditModeContext } from "../contexts/NoteEditModeContext";
import { FaExclamationCircle } from "react-icons/fa";
import commonStyles from "../styles/commonStyles";
import AnimatedBackButton from "../components/AnimatedBackButton";

const NotesEditor = () => {
  const { theme } = useContext(ThemeContext);
  const { noteID } = useParams();
  const { currentUser } = useContext(CurrentUserContext);
  const { currentDate } = useContext(CurrentDateContext);
  const { editMode, setEditMode } = useContext(NoteEditModeContext);

  const [viewButtonHover, setViewButtonHover] = useState(false);
  const [saveButtonHover, setSaveButtonHover] = useState(false);
  const [editButtonHover, setEditButtonHover] = useState(false);

  const [error, setError] = useState("");
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  const [editedBody, setEditedBody] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedTags, setEditedTags] = useState("");
  const [arrayTags, setArrayTags] = useState([]);

  const [isMobile, setIsMobile] = useState(false);

  const titleRef = useRef(null);
  const [titleRefWidth, setTitleRefWidth] = useState(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const { data: noteData, refetch: refetchNote } = useQuery(
    ["noteData", noteID],
    () => fetchNoteData({ noteID: noteID, userID: currentUser }),
    {
      enabled: !!currentUser && !!noteID,
      onError: (err) => {
        setError(err.message);
        setShowErrorBanner(true);
      },
    },
  );

  useEffect(() => {
    if (noteData && noteData.data) {
      setEditedBody(noteData.data.body);
      setEditedTitle(noteData.data.title);
      setEditedTags(noteData.data.tags.join(", "));
      setArrayTags(noteData.data.tags || []);
    }
  }, [noteData]);

  const patchNote = useMutation(patchNoteData, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: () => {
      refetchNote();
      setEditMode(false);
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  useEffect(() => {
    if (titleRef.current) {
      setTitleRefWidth(titleRef.current.offsetWidth + 20);
    }
  }, [editedTitle, titleRef.current, editMode]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.style.height = "auto";
      bodyRef.current.style.height = bodyRef.current.scrollHeight + "px";
    }
  }, [editedBody, editMode]);

  return (
    <div style={commonStyles.notes.editor.container(theme, isMobile)}>
      {showErrorBanner && (
        <div
          style={commonStyles.getBannerStyle(
            "errorBannerStyle",
            showErrorBanner,
            theme,
          )}
        >
          <FaExclamationCircle style={commonStyles.bannerIconStyle} />
          <span>{error}</span>
        </div>
      )}

      {noteData ? (
        <div>
          <div
            style={{
              margin: "0 auto",
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: "5px",
              boxSizing: "border-box",
            }}
          >
            <AnimatedBackButton to="/notes" text="Back to Notes" />
          </div>

          {editMode ? (
            /* This div is the edit items container */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: isMobile ? "space-between" : "flex-start",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* This div is the edit buttons container */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: isMobile ? "space-between" : "flex-start",
                  gap: isMobile ? "0px" : "3.5vw",
                  alignItems: "center",
                }}
              >
                <button
                  onMouseEnter={() => setViewButtonHover(true)}
                  onMouseLeave={() => setViewButtonHover(false)}
                  style={commonStyles.notes.editor.noteEditButton(
                    theme,
                    viewButtonHover,
                  )}
                  onClick={() => {
                    setEditMode(false);
                    setSaveButtonHover(false);
                    setViewButtonHover(false);
                  }}
                >
                  View Mode
                </button>
                <button
                  onMouseEnter={() => setSaveButtonHover(true)}
                  onMouseLeave={() => setSaveButtonHover(false)}
                  style={commonStyles.notes.editor.noteEditButton(
                    theme,
                    saveButtonHover,
                  )}
                  onClick={() => {
                    patchNote.mutate({
                      noteID: noteID,
                      userID: currentUser,
                      title: editedTitle,
                      body: editedBody,
                      lastModifiedDate: currentDate,
                      creationDate: noteData.data.creationDate,
                      tags: arrayTags,
                    });
                    refetchNote();
                    setSaveButtonHover(false);
                    setViewButtonHover(false);
                  }}
                >
                  Save
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <input
                  type="text"
                  value={editedTitle}
                  placeholder="Title"
                  onChange={(e) => {
                    setEditedTitle(e.target.value);
                  }}
                  style={commonStyles.notes.editor.editingTitle(
                    theme,
                    isMobile,
                    titleRefWidth,
                  )}
                  maxLength="50"
                />

                <span
                  ref={titleRef}
                  style={{
                    position: "absolute",
                    visibility: "hidden",
                    whiteSpace: "pre",
                    fontSize: commonStyles.notes.editor.editingTitle(
                      theme,
                      isMobile,
                    ).fontSize,
                    fontWeight: "bold",
                    fontFamily: "inherit",
                  }}
                >
                  {editedTitle || " "}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignSelf: "flex-start",
                }}
              >
                <input
                  type="text"
                  value={editedTags}
                  placeholder="Tags (comma separated)"
                  onChange={(e) => {
                    setEditedTags(e.target.value);
                    setArrayTags(
                      e.target.value
                        ? [
                            ...new Set(
                              e.target.value
                                .split(",")
                                .map((tag) => tag.trim())
                                .filter(Boolean),
                            ),
                          ]
                        : [],
                    );
                  }}
                  style={commonStyles.notes.editor.editingTags(theme, isMobile)}
                />
              </div>

              <div>
                <textarea
                  ref={bodyRef}
                  value={editedBody}
                  placeholder="Write your note here..."
                  onChange={(e) => setEditedBody(e.target.value)}
                  rows="6"
                  style={commonStyles.notes.editor.editingBody(theme, isMobile)}
                />
              </div>
            </div>
          ) : (
            <div>
              <button
                onMouseEnter={() => setEditButtonHover(true)}
                onMouseLeave={() => setEditButtonHover(false)}
                style={commonStyles.notes.editor.noteEditButton(
                  theme,
                  editButtonHover,
                )}
                onClick={() => {
                  setEditMode(true);
                  setEditButtonHover(false);
                }}
              >
                Edit
              </button>

              {/* This div is used as a container for the note title and dates */}
              <div
                style={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  justifyContent: "space-between",
                }}
              >
                <h1
                  style={commonStyles.notes.editor.noteTitle(theme, isMobile)}
                >
                  {editedTitle}
                </h1>
                <div
                  style={commonStyles.notes.editor.noteDates(theme, isMobile)}
                >
                  <p>
                    Last edited:{" "}
                    {new Date(noteData.data.lastModifiedDate).toLocaleString()}
                  </p>
                  <p>
                    Created at:{" "}
                    {new Date(noteData.data.creationDate).toLocaleString()}
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginTop: "10px",
                  flexWrap: "wrap",
                }}
              >
                {arrayTags &&
                  arrayTags.map((tag) => {
                    return (
                      <div key={tag} style={commonStyles.notes.tagItem(theme)}>
                        {tag}
                      </div>
                    );
                  })}
              </div>
              <div
                style={commonStyles.notes.editor.noteBody(theme, isMobile)}
                dangerouslySetInnerHTML={{
                  __html: marked.parse(editedBody || ""),
                }}
              ></div>
            </div>
          )}
        </div>
      ) : (
        <p>Loading note...</p>
      )}
    </div>
  );
};

export default NotesEditor;
