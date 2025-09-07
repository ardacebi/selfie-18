import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import BlurredWindow from "./BlurredWindow";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import { useContext } from "react";
import { IconContext } from "react-icons";
import { CurrentDateContext } from "../contexts/CurrentDateContext";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { HomepageDisplayEvent } from "./Events";
import { HomepageDisplayActivity } from "./Activities";
import { HomepageDisplayNote } from "./HomepageDisplayNote";
import fetchAllActivitiesData from "../data_fetching/fetchAllActivitiesData";
import fetchAllEventsData from "../data_fetching/fetchAllEventsData";
import fetchAllNotesData from "../data_fetching/fetchAllNotesData";

const RecentStuffCard = ({ isMobile }) => {
  const { currentDate } = useContext(CurrentDateContext);
  const { currentUser } = useContext(CurrentUserContext);
  const { theme } = useContext(ThemeContext);
  const [isLeftArrowHovered, setIsLeftArrowHovered] = useState(false);
  const [isRightArrowHovered, setIsRightArrowHovered] = useState(false);

  const { data: eventsData, refetch: refetchEvents } = useQuery(
    ["userEvents", currentUser],
    () => fetchAllEventsData({ userID: currentUser }),
    { enabled: !!currentUser, refetchOnMount: true, staleTime: 0 },
  );

  const { data: activitiesData, refetch: refetchActivities } = useQuery(
    ["userActivities", currentUser],
    () => fetchAllActivitiesData({ userID: currentUser }),
    { enabled: !!currentUser, refetchOnMount: true, staleTime: 0 },
  );

  const { data: notesData, refetch: refetchNotes } = useQuery(
    ["userNotes", currentUser],
    () => fetchAllNotesData({ userID: currentUser }),
    { enabled: !!currentUser, refetchOnMount: true, staleTime: 0 },
  );

  useEffect(() => {
    refetchEvents();
    refetchActivities();
    refetchNotes();
  }, [refetchEvents, refetchActivities, refetchNotes]);

  const [allEvents, setAllEvents] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [allNotes, setAllNotes] = useState([]);

  useEffect(() => {
    if (eventsData) setAllEvents(eventsData.data);
    if (activitiesData) setAllActivities(activitiesData.data);
    if (notesData) setAllNotes(notesData.data);
  }, [eventsData, activitiesData, notesData]);

  const [nextEvent, setNextEvent] = useState(null);
  const [pendingActivity, setPendingActivity] = useState(null);
  const [lastEditedNote, setLastEditedNote] = useState(null);

  useEffect(() => {
    if (allEvents.length > 0) {
      const upcoming = allEvents.filter((event) => {
        const eventDate = new Date(event.date);
        const eventDay = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate(),
        );
        const currentDay = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        return eventDay >= currentDay;
      });
      if (upcoming.length > 0) {
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
        setNextEvent(upcoming[0]);
      }
    }

    if (allActivities.length > 0) {
      const pending = allActivities.filter((activity) => !activity.isCompleted);
      if (pending.length > 0) {
        pending.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        setPendingActivity(pending[0]);
      }
    }

    if (allNotes.length > 0) {
      const notes = [...allNotes];
      notes.sort(
        (a, b) => new Date(b.lastModifiedDate) - new Date(a.lastModifiedDate),
      );
      setLastEditedNote(notes[0]);
    }
  }, [allEvents, allActivities, allNotes, currentDate]);

  const items = useMemo(() => {
    const newItems = [];
    if (nextEvent) {
      newItems.push({
        type: "event",
        item: nextEvent,
        label: "Next Event",
      });
    }
    if (pendingActivity) {
      newItems.push({
        type: "activity",
        item: pendingActivity,
        label: "Pending Activity",
      });
    }
    if (lastEditedNote) {
      newItems.push({
        type: "note",
        item: lastEditedNote,
        label: "Last Edited Note",
      });
    }
    return newItems;
  }, [nextEvent, pendingActivity, lastEditedNote]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userIsControlling, setUserIsControlling] = useState(false);

  useEffect(() => {
    if (items.length > 1 && !userIsControlling) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [items, userIsControlling]);

  useEffect(() => {
    if (userIsControlling) {
      const timer = setInterval(() => {
        setUserIsControlling(false);
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [userIsControlling]);

  // If the items array length changes and the current index is out of bounds, reset it.
  useEffect(() => {
    if (currentIndex >= items.length) setCurrentIndex(0);
  }, [items, currentIndex]);

  return (
    <BlurredWindow
      width="500px"
      padding={isMobile ? "20px" : "30px"}
      style={{
        marginTop: "20px",
      }}
    >
      {items[currentIndex] ? (
        <div
          style={{ color: theme === "dark" ? "white" : "black", width: "100%" }}
        >
          <div style={{ alignSelf: "center", marginBottom: "10px" }}>
            <h3 style={{ marginBottom: "20px" }}>
              {items[currentIndex].label}
            </h3>
            <div>
              {items[currentIndex].label === "Next Event" && (
                <HomepageDisplayEvent
                  eventData={items[currentIndex].item}
                  isMobile={isMobile}
                />
              )}
              {items[currentIndex].label === "Pending Activity" && (
                <HomepageDisplayActivity
                  activityData={items[currentIndex].item}
                  isMobile={isMobile}
                />
              )}
              {items[currentIndex].label === "Last Edited Note" && (
                <HomepageDisplayNote
                  noteData={items[currentIndex].item}
                  isMobile={isMobile}
                />
              )}
            </div>
          </div>
          {items.length > 1 && (
            <IconContext.Provider
              value={{
                size: isMobile ? "30px" : "18px",
                color: theme === "dark" ? "white" : "black",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onMouseEnter={() => setIsLeftArrowHovered(true)}
                  onMouseLeave={() => setIsLeftArrowHovered(false)}
                  onClick={() => {
                    if (!userIsControlling) setUserIsControlling(true);
                    if (currentIndex === 0) setCurrentIndex(items.length - 1);
                    else setCurrentIndex((currentIndex - 1) % items.length);
                  }}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "transparent",
                    border: "none",
                    alignSelf: "flex-start",
                    boxShadow: "none",
                    transform: isLeftArrowHovered ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.2s ease-in-out",
                    cursor: "pointer",
                  }}
                >
                  <FaArrowLeft />
                </button>

                <button
                  onMouseEnter={() => setIsRightArrowHovered(true)}
                  onMouseLeave={() => setIsRightArrowHovered(false)}
                  onClick={() => {
                    if (!userIsControlling) setUserIsControlling(true);
                    setCurrentIndex((currentIndex + 1) % items.length);
                  }}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "transparent",
                    border: "none",
                    alignSelf: "flex-end",
                    boxShadow: "none",
                    transform: isRightArrowHovered ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.2s ease-in-out",
                    cursor: "pointer",
                  }}
                >
                  <FaArrowRight />
                </button>
              </div>
            </IconContext.Provider>
          )}
        </div>
      ) : (
        <div display="flex" flexdirection="column" alignitems="center">
          <div
            style={{
              color: theme === "dark" ? "white" : "black",
              textAlign: "center",
              breakWord: "break-word",
              fontSize: isMobile ? "24px" : "21px",
              margin: "10px",
              fontWeight: "bold",
            }}
          >
            Nothing here for now!
          </div>
          <div
            style={{
              color: theme === "dark" ? "white" : "black",
              textAlign: "center",
              breakWord: "break-word",
              fontSize: isMobile ? "16px" : "14px",
              margin: "10px",
              fontStyle: "italic",
            }}
          >
            Come here after you have used Selfie a bit more!
          </div>
        </div>
      )}
    </BlurredWindow>
  );
};

export default RecentStuffCard;
