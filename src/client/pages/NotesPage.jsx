import { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { marked } from "marked";
import { ThemeContext } from "../contexts/ThemeContext";
import commonStyles from "../styles/commonStyles";
import postNewNote from "../data_creation/postNewNote";
import fetchAllNotesData from "../data_fetching/fetchAllNotesData";
import patchDeleteNote from "../data_deletion/patchDeleteNote";
import postDuplicateNote from "../data_creation/postDuplicateNote";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { CurrentDateContext } from "../contexts/CurrentDateContext";
import FormInput from "../components/FormInput";
import BlurredWindow from "../components/BlurredWindow";
import PageTransition from "../components/PageTransition";
import { FaExclamationCircle, FaCopy } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { IconContext } from "react-icons";
import { NoteEditModeContext } from "../contexts/NoteEditModeContext";

const NotesPage = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { currentDate } = useContext(CurrentDateContext);
  const { currentUser } = useContext(CurrentUserContext);
  const { setEditMode } = useContext(NoteEditModeContext);
  const [allNotes, setAllNotes] = useState([]);
  const [noteSorting, setNoteSorting] = useState("creationDate");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [filterTags, setFilterTags] = useState([]);

  // Hover states for notes and buttons
  const [hoveredNoteId, setHoveredNoteId] = useState(null);
  const [newNoteHover, setNewNoteHover] = useState(false);
  const [createNoteHover, setCreateNoteHover] = useState(false);
  const [cancelNoteHover, setCancelNoteHover] = useState(false);
  const [dropdownNoteHover, setDropdownNoteHover] = useState(false);
  const [deleteButtonHovered, setDeleteButtonHovered] = useState(null);
  const [copyButtonHovered, setCopyButtonHovered] = useState(false);
  const [hoveredTag, setHoveredTag] = useState(null);

  const [showNewNoteForm, setShowNewNoteForm] = useState(false);

  const [error, setError] = useState("");
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

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

  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 500,
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { data: notesData, refetch: refetchNotes } = useQuery(
    ["userNotes", currentUser],
    () => fetchAllNotesData({ userID: currentUser }),
    { enabled: !!currentUser, refetchOnMount: true, staleTime: 0 },
  );

  useEffect(() => {
    if (notesData) {
      setAllNotes(notesData.data);
    }
  }, [notesData]);

  const postNote = useMutation(postNewNote, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: (res) => {
      setShowNewNoteForm(false);
      const newNoteID = res.data._id;
      setEditMode(true);
      refetchNotes();
      navigate(`/notes/${newNoteID}`);
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  const handleNewNoteSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const title = formData.get("title");
      const tags = formData.get("tags");
      postNote.mutate({
        title: title,
        creationDate: currentDate,
        lastModifiedDate: currentDate,
        body: " ",
        tags: tags
          ? [
              ...new Set(
                tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              ),
            ]
          : [],
        userID: currentUser,
      });
    } catch (err) {
      setError(err.message);
      setShowErrorBanner(true);
    }
  };

  const patchDeleteNoteMutation = useMutation(patchDeleteNote, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: () => {
      refetchNotes();
      setHoveredNoteId(null);
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  const postDuplicateNoteMutation = useMutation(postDuplicateNote, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: () => {
      refetchNotes();
      setHoveredNoteId(null);
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  const sortedNotes = useMemo(() => {
    if (!allNotes || allNotes.length === 0) return [];
    else {
      const filteredNotes = filterTags.length
        ? allNotes.filter(
            (note) =>
              note.tags && filterTags.every((tag) => note.tags.includes(tag)),
          )
        : allNotes;

      return [...filteredNotes].sort((a, b) => {
        if (noteSorting === "alphabetical") {
          return a.title.localeCompare(b.title);
        } else if (noteSorting === "creationDate") {
          return new Date(b.creationDate) - new Date(a.creationDate);
        } else if (noteSorting === "lastModifiedDate") {
          return new Date(b.lastModifiedDate) - new Date(a.lastModifiedDate);
        } else if (noteSorting === "bodyLength") {
          return b.body.length - a.body.length;
        }
      });
    }
  }, [allNotes, noteSorting, filterTags]);

  return (
    <PageTransition>
      <div style={{ color: theme === "dark" ? "white" : "black" }}>
        {showNewNoteForm && (
          <div style={commonStyles.notes.newNoteFormOverlay}>
            <div
              style={commonStyles.notes.newNoteFormContainer(
                theme,
                windowHeight,
              )}
            >
              <form onSubmit={handleNewNoteSubmit}>
                <FormInput
                  name="title"
                  placeholder="Title"
                  required={true}
                  maxLength="50"
                />
                <FormInput
                  name="tags"
                  placeholder="Tags (comma separated)"
                  required={false}
                />
                <div style={{ marginTop: "10px" }}>
                  <button
                    type="submit"
                    onMouseEnter={() => setCreateNoteHover(true)}
                    onMouseLeave={() => setCreateNoteHover(false)}
                    style={{
                      ...commonStyles.notes.createNoteButton(theme, false),
                      ...(createNoteHover
                        ? commonStyles.notes.noteButtonHover(theme)
                        : {}),
                    }}
                  >
                    Create Note
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewNoteForm(false);
                      setCancelNoteHover(false);
                      setCreateNoteHover(false);
                      setShowErrorBanner(false);
                      setError("");
                    }}
                    onMouseEnter={() => setCancelNoteHover(true)}
                    onMouseLeave={() => setCancelNoteHover(false)}
                    style={{
                      ...commonStyles.notes.cancelNoteButton(theme),
                      ...(cancelNoteHover
                        ? commonStyles.notes.noteButtonHover(theme)
                        : {}),
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>

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
            </div>
          </div>
        )}
        <BlurredWindow
          width={isMobile ? "95%" : "850px"}
          padding={isMobile ? "10px" : "20px"}
        >
          <div style={commonStyles.notes.notesPage(isMobile)}>
            <div style={commonStyles.calendar.header.title}>
              <h1
                style={{
                  ...commonStyles.welcomeGradient(theme),
                  fontSize: isMobile ? "40px" : "32px",
                }}
                key={theme}
              >
                Notes
              </h1>
            </div>

            {!showNewNoteForm && (
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

            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <button
                onClick={() => setShowNewNoteForm(true)}
                onMouseEnter={() => setNewNoteHover(true)}
                onMouseLeave={() => setNewNoteHover(false)}
                style={{
                  ...commonStyles.notes.newNoteButton(
                    theme,
                    isMobile || sortedNotes.length < 1, //If there are no notes, make the button big as it is visualized from mobile
                  ),
                  ...(newNoteHover
                    ? commonStyles.notes.noteButtonHover(theme)
                    : {}),
                }}
              >
                New Note
              </button>

              <div name="notesSortingButton" style={{ position: "relative" }}>
                {sortedNotes.length > 1 && (
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    onMouseEnter={() => setDropdownNoteHover(true)}
                    onMouseLeave={() => setDropdownNoteHover(false)}
                    style={{
                      ...commonStyles.notes.dropdownNoteButton(theme),
                      ...(dropdownNoteHover
                        ? commonStyles.notes.dropdownNoteButtonHover(theme)
                        : {}),
                    }}
                  >
                    {noteSorting === "alphabetical"
                      ? "Alphabetical"
                      : noteSorting === "creationDate"
                        ? "Creation Date"
                        : noteSorting === "lastModifiedDate"
                          ? "Last Modified Date"
                          : "Body Length"}
                  </button>
                )}

                {/* Dropdown Menu */}
                {sortedNotes.length > 1 && (
                  <div
                    style={{
                      ...commonStyles.notes.dropdownMenuInactive(theme),
                      ...(showSortDropdown
                        ? commonStyles.notes.dropdownMenuActive
                        : {}),
                    }}
                  >
                    <div
                      onClick={() => {
                        setNoteSorting("alphabetical");
                        setShowSortDropdown(false);
                      }}
                      style={commonStyles.notes.dropdownMenuItem(theme)}
                    >
                      Alphabetical
                    </div>
                    <div
                      onClick={() => {
                        setNoteSorting("creationDate");
                        setShowSortDropdown(false);
                      }}
                      style={commonStyles.notes.dropdownMenuItem(theme)}
                    >
                      Creation Date
                    </div>
                    <div
                      onClick={() => {
                        setNoteSorting("lastModifiedDate");
                        setShowSortDropdown(false);
                      }}
                      style={commonStyles.notes.dropdownMenuItem(theme)}
                    >
                      Last Modified Date
                    </div>
                    <div
                      onClick={() => {
                        setNoteSorting("bodyLength");
                        setShowSortDropdown(false);
                      }}
                      style={commonStyles.notes.dropdownMenuItem(theme)}
                    >
                      Body Length
                    </div>
                  </div>
                )}
              </div>
            </div>

            {sortedNotes.length === 0 && (
              <div>
                <p>There are no Notes at the moment!</p>
              </div>
            )}

            <div style={commonStyles.notes.notesPage(isMobile)}>
              {sortedNotes.map((note) => {
                const HTMLbody = marked.parse(note.body);

                return (
                  <div
                    key={note._id}
                    onMouseEnter={() => setHoveredNoteId(note._id)}
                    onMouseLeave={() => setHoveredNoteId(null)}
                    onClick={() => navigate(`/notes/${note._id}`)}
                    style={{
                      ...commonStyles.notes.noteItem(theme),
                      ...(hoveredNoteId === note._id
                        ? commonStyles.notes.noteItemHover
                        : {}),
                    }}
                  >
                    <div style={commonStyles.notes.noteContent}>
                      <div>
                        <h2
                          style={{
                            wordWrap: "break-word",
                            wordBreak: "break-word",
                          }}
                        >
                          {note.title}
                        </h2>
                        <p style={commonStyles.notes.notesDate(theme)}>
                          Created on:{" "}
                          {new Date(note.creationDate).toLocaleDateString()} |
                          Last modified:{" "}
                          {new Date(note.lastModifiedDate).toLocaleDateString()}
                        </p>
                        <div
                          style={{ wordBreak: "break-word" }}
                          dangerouslySetInnerHTML={{
                            __html:
                              HTMLbody.length > 200
                                ? HTMLbody.substring(0, 200) + "..."
                                : HTMLbody,
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onMouseEnter={() => setDeleteButtonHovered(note._id)}
                        onMouseLeave={() => setDeleteButtonHovered(null)}
                        style={{
                          ...commonStyles.notes.noteDeleteButton,
                          ...(deleteButtonHovered === note._id
                            ? commonStyles.notes.noteDeleteButtonHover(isMobile)
                            : {}),
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          patchDeleteNoteMutation.mutate({
                            noteID: note._id,
                            userID: currentUser,
                          });
                        }}
                      >
                        <IconContext.Provider
                          value={{
                            color: theme === "dark" ? "white" : "black",
                            size: isMobile ? "30px" : "20px",
                          }}
                        >
                          <RiDeleteBin5Fill />
                        </IconContext.Provider>
                      </button>
                      <button
                        type="button"
                        onMouseEnter={() => setCopyButtonHovered(note._id)}
                        onMouseLeave={() => setCopyButtonHovered(null)}
                        style={{
                          ...commonStyles.notes.noteDeleteButton,
                          ...(copyButtonHovered === note._id
                            ? commonStyles.notes.noteDeleteButtonHover(isMobile)
                            : {}),
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          postDuplicateNoteMutation.mutate({
                            noteID: note._id,
                            userID: currentUser,
                            creationDate: currentDate,
                          });
                        }}
                      >
                        <IconContext.Provider
                          value={{
                            color: theme === "dark" ? "white" : "black",
                            size: isMobile ? "30px" : "20px",
                          }}
                        >
                          <FaCopy />
                        </IconContext.Provider>
                      </button>
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          marginTop: "10px",
                          maxWidth: "250px",
                          flexWrap: "wrap",
                        }}
                      >
                        {note.tags.map((tag) => {
                          return (
                            <div
                              key={tag}
                              onMouseEnter={() => setHoveredTag(tag)}
                              onMouseLeave={() => setHoveredTag(null)}
                              style={commonStyles.notes.tagItem(
                                theme,
                                hoveredTag === tag &&
                                  hoveredNoteId === note._id,
                                filterTags.includes(tag),
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (filterTags.includes(tag)) {
                                  setFilterTags(
                                    filterTags.filter((t) => t !== tag),
                                  );
                                } else {
                                  setFilterTags([...filterTags, tag]);
                                }
                              }}
                            >
                              {tag}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </BlurredWindow>
      </div>
    </PageTransition>
  );
};

export default NotesPage;
