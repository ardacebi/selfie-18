import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate, Form } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import fetchEventData from "../data_fetching/fetchEventData";
import patchEventData from "../data_creation/patchEventData";
import patchDeleteEvent from "../data_deletion/patchDeleteEvent";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrentDateContext } from "../contexts/CurrentDateContext";
import { FaExclamationCircle } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { IconContext } from "react-icons";
import {
  iCalendarGenerator,
  downloadICalendarFile,
} from "../components/iCalendar";
import commonStyles from "../styles/commonStyles";
import AnimatedBackButton from "../components/AnimatedBackButton";
import BlurredWindow from "../components/BlurredWindow";
import PageTransition from "../components/PageTransition";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";
import FormSelect from "../components/FormSelect";

const EventsEditor = () => {
  const { theme } = useContext(ThemeContext);
  const { currentDate } = useContext(CurrentDateContext);
  const { eventID } = useParams();
  const { currentUser } = useContext(CurrentUserContext);

  const [deleteButtonHovered, setDeleteButtonHovered] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);

  const [error, setError] = useState("");
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedDate, setEditedDate] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [editedEventEnd, setEditedEventEnd] = useState(null);
  const [formattedEventEnd, setFormattedEventEnd] = useState("");
  const [editedLocation, setEditedLocation] = useState("");
  const [editedType, setEditedType] = useState(null);
  const [editedFrequencyType, setEditedFrequencyType] = useState(null);
  const [editedFrequencyWeekDays, setEditedFrequencyWeekDays] = useState([]);
  const [editedRepetition, setEditedRepetition] = useState(0);

  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();

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

  const { data: eventData, refetch: refetchEvent } = useQuery(
    ["eventData", eventID],
    () => fetchEventData({ eventID: eventID, userID: currentUser }),
    {
      enabled: !!currentUser && !!eventID,
      onError: (err) => {
        setError(err.message);
        setShowErrorBanner(true);
      },
    },
  );

  useEffect(() => {
    if (eventData) {
      setEditedTitle(eventData.data.title || "");
      setEditedDescription(eventData.data.description || "");
      setEditedDate(eventData.data.date || "");
      setEditedEventEnd(eventData.data.eventEnd || null);
      setEditedLocation(eventData.data.location || "");
      setEditedType(eventData.data.type || null);
      setEditedFrequencyType(eventData.data.frequencyType || null);
      setEditedFrequencyWeekDays(eventData.data.frequencyWeekDays || []);
      setEditedRepetition(eventData.data.repetition || 0);
      setHasEndDate(!!eventData.data.eventEnd);
    }
  }, [eventData]);

  useEffect(() => {
    if (editedDate) {
      const dateObj = new Date(editedDate);
      const timeZoneOffset = dateObj.getTimezoneOffset() * 60000;
      const formatted =
        editedEventEnd === null
          ? new Date(dateObj - timeZoneOffset).toISOString().slice(0, 10)
          : new Date(dateObj - timeZoneOffset).toISOString().slice(0, 16);
      setFormattedDate(formatted);
    }

    if (editedEventEnd) {
      const dateObj = new Date(editedEventEnd);
      const timeZoneOffset = dateObj.getTimezoneOffset() * 60000;
      const formatted = new Date(dateObj - timeZoneOffset)
        .toISOString()
        .slice(0, 16);
      setFormattedEventEnd(formatted);
    }
  }, [editedDate, editedEventEnd]);

  const formatToDate = (fDate) => {
    if (!fDate) return null;
    if (fDate.length === 10) {
      return new Date(fDate + "T00:00:00");
    }
    if (fDate.length === 16) {
      return new Date(fDate + ":00");
    }
    return new Date(fDate);
  };

  const patchEvent = useMutation(patchEventData, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: () => {
      refetchEvent();
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  const handleEventPatchSubmit = async (e) => {
    try {
      setShowErrorBanner(false);
      e.preventDefault();
      if (editedEventEnd) {
        const startDate = new Date(editedDate);
        const endDate = new Date(editedEventEnd);

        if (endDate < startDate) {
          setError("The event's end cannot be earlier than the event's start.");
          setShowErrorBanner(true);
          return;
        }

        if (
          startDate.getFullYear() !== endDate.getFullYear() ||
          startDate.getMonth() !== endDate.getMonth() ||
          startDate.getDate() !== endDate.getDate()
        ) {
          setError(
            "The event's end cannot be in a different day from the event's start.",
          );
          setShowErrorBanner(true);
          return;
        }
      }

      patchEvent.mutate({
        eventID: eventID,
        userID: currentUser,
        title: editedTitle,
        description: editedDescription,
        date: editedDate,
        eventEnd: editedEventEnd,
        location: editedLocation,
        type: editedType,
        frequencyType: editedFrequencyType,
        frequencyWeekDays: editedFrequencyWeekDays,
        repetition: editedRepetition,
      });

      navigate("/calendar");
    } catch (error) {
      setError(error.message);
      setShowErrorBanner(true);
    }
  };

  const handleDownload = () => {
    const iCalendarContent = iCalendarGenerator(eventData.data, currentDate);
    downloadICalendarFile(iCalendarContent, `my_event.ics`);
  };

  const patchDeleteEventMutation = useMutation(patchDeleteEvent, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: () => {
      setError("");
      setShowErrorBanner(false);
      navigate("/calendar");
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  return (
    <PageTransition>
      <div>
        <BlurredWindow
          width={isMobile ? "95%" : "850px"}
          padding={isMobile ? "10px" : "20px"}
        >
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

          {eventData ? (
            <div style={{ position: "relative" }}>
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
                <AnimatedBackButton
                  to="/calendar"
                  text="Back to Calendar"
                  style={{ alignSelf: "flex-start" }}
                />

                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setDeleteButtonHovered(true)}
                    onMouseLeave={() => setDeleteButtonHovered(false)}
                    style={{
                      ...commonStyles.notes.noteDeleteButton,
                      ...(deleteButtonHovered
                        ? commonStyles.notes.noteDeleteButtonHover(isMobile)
                        : {}),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      patchDeleteEventMutation.mutate({
                        eventID: eventID,
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
                </div>
              </div>

              <form
                onSubmit={handleEventPatchSubmit}
                style={{ maxWidth: "250px" }}
              >
                <FormInput
                  name="title"
                  placeholder="Title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  required={true}
                  maxLength="20"
                />
                <FormInput
                  name="description"
                  placeholder="Description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  maxLength="150"
                  style={{ marginTop: "10px" }}
                />
                <p
                  style={{
                    color:
                      theme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
                  }}
                >
                  Event Start
                </p>
                <FormInput
                  name="date"
                  type={editedEventEnd === null ? "date" : "datetime-local"}
                  value={formattedDate || ""}
                  onChange={(e) => setEditedDate(formatToDate(e.target.value))}
                  required={true}
                  style={{ marginTop: "10px" }}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <p
                    style={{
                      color:
                        theme === "dark"
                          ? "rgb(255, 255, 255)"
                          : "rgb(0, 0, 0)",
                      marginRight: "auto",
                    }}
                  >
                    Event has a Duration
                  </p>
                  <FormInput
                    type="checkbox"
                    checked={hasEndDate}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        setHasEndDate(false);
                        setEditedEventEnd(null);
                      } else {
                        setHasEndDate(true);
                        setEditedEventEnd(editedDate);
                      }
                    }}
                    style={{ transform: "scale(1.1)" }}
                  />
                </div>

                {hasEndDate && (
                  <div>
                    <p
                      style={{
                        color:
                          theme === "dark"
                            ? "rgb(255, 255, 255)"
                            : "rgb(0, 0, 0)",
                      }}
                    >
                      Event's End
                    </p>
                    <FormInput
                      name="eventEnd"
                      type="datetime-local"
                      placeholder="Event End"
                      value={formattedEventEnd || ""}
                      onChange={(e) =>
                        setEditedEventEnd(formatToDate(e.target.value))
                      }
                    />
                  </div>
                )}

                <FormInput
                  name="location"
                  placeholder="Location"
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                  style={{ marginTop: "10px" }}
                />
                <p
                  style={{
                    color:
                      theme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
                  }}
                >
                  Event Type
                </p>
                <FormSelect
                  name="type"
                  value={editedType || ""}
                  onChange={(e) => setEditedType(e.target.value)}
                  style={{ marginTop: "10px" }}
                >
                  <option value="basic">Basic</option>
                  <option value="recurring">Recurring</option>
                </FormSelect>
                {editedType === "recurring" && (
                  <div>
                    <p
                      style={{
                        color:
                          theme === "dark"
                            ? "rgb(255, 255, 255)"
                            : "rgb(0, 0, 0)",
                      }}
                    >
                      Frequency of the Event
                    </p>
                    <FormSelect
                      name="frequencyType"
                      value={editedFrequencyType || ""}
                      onChange={(e) => setEditedFrequencyType(e.target.value)}
                      style={{ marginTop: "10px" }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </FormSelect>
                    {editedFrequencyType === "weekly" && (
                      <div>
                        <p
                          style={{
                            color:
                              theme === "dark"
                                ? "rgb(255, 255, 255)"
                                : "rgb(0, 0, 0)",
                          }}
                        >
                          Frequency in a Week
                        </p>
                        <FormSelect
                          name="frequencyWeekDays"
                          value={editedFrequencyWeekDays}
                          multiple={true}
                          onChange={(e) => {
                            setEditedFrequencyWeekDays(
                              Array.from(
                                e.target.selectedOptions,
                                (option) => option.value,
                              ),
                            );
                          }}
                          style={{ marginTop: "10px" }}
                        >
                          <option value="0">Monday</option>
                          <option value="1">Tuesday</option>
                          <option value="2">Wednesday</option>
                          <option value="3">Thursday</option>
                          <option value="4">Friday</option>
                          <option value="5">Saturday</option>
                          <option value="6">Sunday</option>
                        </FormSelect>
                      </div>
                    )}

                    <p
                      style={{
                        color:
                          theme === "dark"
                            ? "rgb(255, 255, 255)"
                            : "rgb(0, 0, 0)",
                      }}
                    >
                      Repetitions
                    </p>
                    <FormInput
                      name="repetition"
                      type="text"
                      placeholder="Infinite"
                      value={editedRepetition || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (isNaN(value) || value <= 0) {
                          setEditedRepetition(0);
                        } else {
                          setEditedRepetition(value);
                        }
                      }}
                      style={{ marginTop: "10px" }}
                    />
                  </div>
                )}

                <FormButton>Save</FormButton>
              </form>
              <Button onClick={handleDownload}>Download</Button>
            </div>
          ) : (
            <p>Loading event...</p>
          )}
        </BlurredWindow>
      </div>
    </PageTransition>
  );
};

export default EventsEditor;
