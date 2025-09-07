import { useState, useContext, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import commonStyles from "../styles/commonStyles.js";
import FormInput from "./FormInput.jsx";
import { FaExclamationCircle, FaCheck, FaEdit } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { IoWarning } from "react-icons/io5";
import { IconContext } from "react-icons";
import { ThemeContext } from "../contexts/ThemeContext.jsx";
import { CurrentUserContext } from "../contexts/CurrentUserContext.jsx";
import postNewActivity from "../data_creation/postNewActivity.js";
import patchActivityData from "../data_creation/patchActivityData.js";
import patchDeleteActivity from "../data_deletion/patchDeleteActivity.js";
import { CurrentDateContext } from "../contexts/CurrentDateContext.jsx";
import { CalendarViewModeContext } from "../contexts/CalendarViewModeContext.jsx";
import FormButton from "./FormButton.jsx";

// days between two dates
const getDayDiff = (date1, date2) =>
  Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));

export const NewActivityForm = ({
  showForm,
  setShowForm,
  refetchAllActivitiesData,
  endDate,
  setShowErrorBanner,
  showErrorBanner,
  error = "",
  setError,
}) => {
  const { theme } = useContext(ThemeContext);
  const { currentDate } = useContext(CurrentDateContext);
  const { currentUser } = useContext(CurrentUserContext);
  const navigate = useNavigate();
  const [notifyMe, setNotifyMe] = useState(false);

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

  const [formattedEndDate, setFormattedEndDate] = useState(null);

  useEffect(() => {
    if (endDate) {
      const dateObj = new Date(endDate);
      const timeZoneOffset = dateObj.getTimezoneOffset() * 60000;
      const formatted = new Date(dateObj - timeZoneOffset)
        .toISOString()
        .slice(0, 10);
      setFormattedEndDate(formatted);
    }
  }, [endDate]);

  const formatToDate = (fDate) => {
    if (!fDate) return null;
    else return new Date(fDate + "T00:00:00");
  };

  const postNewActivityMutation = useMutation(postNewActivity, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: (res) => {
      setError("");
      setShowErrorBanner(false);
      setShowForm(false);
      refetchAllActivitiesData();
      try {
        const key = "notify_activities";
        const store = JSON.parse(localStorage.getItem(key) || "{}");
        const id = res?.data?._id;
        if (id) {
          store[id] = !!notifyMe;
          localStorage.setItem(key, JSON.stringify(store));
        }
        if (
          notifyMe &&
          typeof window !== "undefined" &&
          "Notification" in window
        ) {
          Notification.requestPermission?.();
        }
      } catch {}
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  const handleNewActivitySubmit = async (e) => {
    try {
      e.preventDefault();
      const formData = new FormData(e.target);
      const title = formData.get("title");
      const description = formData.get("description");
      const formEndDate = formatToDate(formattedEndDate);
      postNewActivityMutation.mutate({
        title: title,
        description: description,
        startDate: currentDate,
        endDate: formEndDate,
        userID: currentUser,
      });
    } catch (err) {
      setError(err.message);
      setShowErrorBanner(true);
    }
  };

  const cancelButtonClickHandler = () => {
    setShowForm(false);
    setShowErrorBanner(false);
    setError("");
  };

  return (
    <div>
      {showForm && (
        <div style={commonStyles.notes.newNoteFormOverlay}>
          <div
            style={commonStyles.notes.newNoteFormContainer(theme, windowHeight)}
          >
            <form onSubmit={handleNewActivitySubmit}>
              <FormInput
                name="title"
                placeholder="Title"
                required={true}
                maxLength="20"
              />
              <FormInput
                name="description"
                placeholder="Description"
                maxLength="150"
              />
              <p
                style={{
                  color:
                    theme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
                }}
              >
                Activity Ends At:
              </p>
              <FormInput
                name="endDate"
                type="date"
                required={true}
                value={formattedEndDate || ""}
                onChange={(e) => setFormattedEndDate(e.target.value)}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                <input
                  id="act-notify"
                  type="checkbox"
                  checked={notifyMe}
                  onChange={(e) => setNotifyMe(e.target.checked)}
                />
                <label htmlFor="act-notify" style={{ cursor: "pointer" }}>
                  Notify me
                </label>
              </div>
              <div style={{ marginTop: "10px" }}>
                <FormButton>Create Activity</FormButton>
                <FormButton onClick={cancelButtonClickHandler} type="button">
                  Cancel
                </FormButton>
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
    </div>
  );
};

export const DisplayActivities = ({ allActivities = [], date, isMobile }) => {
  const { currentDate } = useContext(CurrentDateContext);
  const navigate = useNavigate();
  const [hoveredActivity, setHoveredActivity] = useState(null);

  // show only deadline day
  const activitiesForDate = allActivities.filter((activity) => {
    const deadline = new Date(activity.endDate);
    return deadline.toDateString() === date.toDateString();
  });

  return (
    <div style={commonStyles.calendar.activities.activitiesContainer}>
      {activitiesForDate.map((activity) => {
        const startDate = new Date(activity.startDate);
        const deadline = new Date(activity.endDate);
        const totalTime = getDayDiff(startDate, deadline);
        const daysRemaining = getDayDiff(currentDate, deadline);

        const isOverdue =
          !activity.isCompleted && deadline < new Date(currentDate);

        const activityDanger =
          daysRemaining <= totalTime / 4 && !activity.isCompleted
            ? "dangerous"
            : daysRemaining <= totalTime / 2 && !activity.isCompleted
              ? "risky"
              : !activity.isCompleted
                ? "safe"
                : "completed";

        return (
          <div
            key={activity._id}
            onClick={() =>
              navigate(`/calendar/activities_editor/${activity._id}`)
            }
            onMouseEnter={() => setHoveredActivity(activity._id)}
            onMouseLeave={() => setHoveredActivity(null)}
            style={{
              ...commonStyles.calendar.activities.activityBox(
                activityDanger,
                hoveredActivity === activity._id,
              ),
              cursor: "pointer",
            }}
          >
            <div
              style={{
                margin: "3px",
                fontSize: isMobile ? "12px" : "15px",
                fontWeight: "bold",
              }}
            >
              {activity.title}
            </div>
            <IconContext.Provider
              value={{
                color: "black",
                size: isMobile ? "15px" : "20px",
                style: {
                  display: activityDanger === "completed" ? "block" : "none",
                },
              }}
            >
              <FaCheck />
            </IconContext.Provider>
            {isOverdue && (
              <div
                style={{
                  ...commonStyles.calendar.activities.overdueOutline,
                  color: "red",
                  fontSize: isMobile ? "8px" : "10px",
                }}
              >
                Overdue
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ActivitiesSummary = ({
  activities = [],
  refetchAllActivitiesData,
  isMobile,
  setError,
  setShowErrorBanner,
}) => {
  const { currentDate } = useContext(CurrentDateContext);
  const { currentUser } = useContext(CurrentUserContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [completion, setCompletion] = useState({});
  const completionUpdateRef = useRef({});
  const [deleteButtonHovered, setDeleteButtonHovered] = useState(null);
  const [editButtonHovered, setEditButtonHovered] = useState(null);

  const patchDeleteActivityMutation = useMutation(patchDeleteActivity, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: () => {
      refetchAllActivitiesData();
      setError("");
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  const updateActivityMutation = useMutation(patchActivityData, {
    onMutate: () => setShowErrorBanner(false),
    onError: (err) => {
      setShowErrorBanner(true);
      setError(err.message);
    },
    onSuccess: () => {
      refetchAllActivitiesData();
      setError("");
    },
  });

  const filteredActivities = activities
    .filter((activity) => !activity.isCompleted)
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));

  const handleCheckboxChange = (
    actTitle,
    actStartDate,
    actEndDate,
    activityID,
    isChecked,
  ) => {
    if (completionUpdateRef.current) {
      clearTimeout(completionUpdateRef.current[activityID]);
      delete completionUpdateRef.current[activityID];
    }

    completionUpdateRef.current[activityID] = setTimeout(() => {
      updateActivityMutation.mutate({
        title: actTitle,
        startDate: actStartDate,
        endDate: actEndDate,
        activityID: activityID,
        isCompleted: isChecked,
        userID: currentUser,
      });
      delete completionUpdateRef.current[activityID];
    }, 2600); //2.6 seconds delay before updating completion status so that user can change their mind
  };

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: theme === "dark" ? "#333" : "#eee",
        color: theme === "dark" ? "white" : "black",
      }}
    >
      {filteredActivities.map((activity) => {
        const startDate = new Date(activity.startDate);
        const endDate = new Date(activity.endDate);
        const current = new Date(currentDate);

        const daysPassed = getDayDiff(startDate, current);
        const daysRemaining = getDayDiff(current, endDate);
        const totalTime = getDayDiff(startDate, endDate);

        const isOverdue = current > endDate;
        const overdueDays = isOverdue
          ? Math.abs(getDayDiff(endDate, current))
          : 0;
        const isCompleted = completion[activity._id] || false;

        const activityDanger =
          daysRemaining <= totalTime / 4 && !isCompleted
            ? "dangerous"
            : daysRemaining <= totalTime / 2 && !isCompleted
              ? "risky"
              : !isCompleted
                ? "safe"
                : "completed";

        return (
          <div
            key={activity._id}
            style={{
              ...commonStyles.calendar.activities.summaryActivityBox(
                activityDanger,
              ),
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 5px",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "35px" : "30px",
                  fontWeight: "bold",
                  alignSelf: "center",
                }}
              >
                {activity.title}
              </div>

              <div
                style={{
                  position: isMobile ? "static" : "absolute",
                  right: 0,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: isMobile ? "10px" : "0",
                }}
              >
                <button
                  type="button"
                  onMouseEnter={() => setDeleteButtonHovered(activity._id)}
                  onMouseLeave={() => setDeleteButtonHovered(null)}
                  style={{
                    ...commonStyles.notes.noteDeleteButton,
                    ...(deleteButtonHovered === activity._id
                      ? commonStyles.notes.noteDeleteButtonHover(isMobile)
                      : {}),
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    patchDeleteActivityMutation.mutate({
                      activityID: activity._id,
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
                  onMouseEnter={() => setEditButtonHovered(activity._id)}
                  onMouseLeave={() => setEditButtonHovered(null)}
                  style={{
                    ...commonStyles.notes.noteDeleteButton,
                    ...(editButtonHovered === activity._id
                      ? commonStyles.notes.noteDeleteButtonHover(isMobile)
                      : {}),
                  }}
                  onClick={() =>
                    navigate(`/calendar/activities_editor/${activity._id}`)
                  }
                >
                  <IconContext.Provider
                    value={{
                      color: theme === "dark" ? "white" : "black",
                      size: isMobile ? "30px" : "20px",
                    }}
                  >
                    <FaEdit />
                  </IconContext.Provider>
                </button>
              </div>
            </div>

            <div
              style={{
                display:
                  activityDanger === "completed" || activityDanger === "safe"
                    ? "none"
                    : "block",
              }}
            >
              <IconContext.Provider
                value={{
                  color: activityDanger === "dangerous" ? "red" : "yellow",
                  size: isMobile ? "55px" : "40px",
                }}
              >
                <IoWarning />
              </IconContext.Provider>
            </div>

            <div
              style={{
                display: activityDanger === "completed" ? "block" : "none",
              }}
            >
              <IconContext.Provider
                value={{
                  color: "black",
                  size: isMobile ? "55px" : "40px",
                }}
              >
                <FaCheck />
              </IconContext.Provider>
            </div>

            <div
              style={{
                display: activity.description ? "block" : "none",
                margin: "5px",
                textDecoration: "underline",
              }}
            >
              {activity.description.length > 200
                ? activity.description.substring(0, 200) + "..."
                : activity.description}
            </div>

            <div style={{ margin: "10px", fontWeight: "bold" }}>
              Days Passed: {daysPassed}
            </div>
            {isOverdue ? (
              <div
                style={{
                  ...commonStyles.calendar.activities.overdueOutline,
                  color: "red",
                  margin: "10px",
                }}
              >
                Overdue by {overdueDays} day(s)!
              </div>
            ) : (
              <div style={{ margin: "10px", fontWeight: "bold" }}>
                Days Remaining: {daysRemaining}
              </div>
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <div
                style={{ margin: "10px", fontWeight: "bold", fontSize: "17px" }}
              >
                Complete Activity:
              </div>
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  setCompletion((prev) => ({
                    ...prev,
                    [activity._id]: newValue,
                  }));
                  handleCheckboxChange(
                    activity.title,
                    activity.startDate,
                    activity.endDate,
                    activity._id,
                    newValue,
                  );
                }}
                style={{ marginRight: "8px", transform: "scale(1.35)" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const HomepageDisplayActivity = ({
  activityData,
  isMobile,
  compact = false,
}) => {
  const navigate = useNavigate();
  const { setCalendarViewMode } = useContext(CalendarViewModeContext);
  const { currentDate } = useContext(CurrentDateContext);
  const [hovered, setHovered] = useState(false);

  const startDate = new Date(activityData.startDate);
  const deadline = new Date(activityData.endDate);
  const daysPassed = getDayDiff(startDate, currentDate);
  const totalTime = getDayDiff(startDate, deadline);
  const daysRemaining = getDayDiff(currentDate, deadline);

  const isOverdue =
    !activityData.isCompleted && deadline < new Date(currentDate);
  const overdueDays = isOverdue
    ? Math.abs(getDayDiff(deadline, currentDate))
    : 0;

  const activityDanger =
    daysRemaining <= totalTime / 4 && !activityData.isCompleted
      ? "dangerous"
      : daysRemaining <= totalTime / 2 && !activityData.isCompleted
        ? "risky"
        : !activityData.isCompleted
          ? "safe"
          : "completed";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        setCalendarViewMode("activities");
        navigate(`/calendar`);
      }}
      style={commonStyles.calendar.activities.homepageActivityBox(
        activityDanger,
        hovered,
      )}
    >
      <div
        style={{
          fontSize: isMobile ? "35px" : "30px",
          fontWeight: "bold",
          alignSelf: "center",
        }}
      >
        {activityData.title}
      </div>

      {/*Warning Icon*/}
      <div
        style={{
          display:
            activityDanger === "completed" || activityDanger === "safe"
              ? "none"
              : "block",
        }}
      >
        <IconContext.Provider
          value={{
            color: activityDanger === "dangerous" ? "red" : "yellow",
            size: isMobile ? "55px" : "40px",
          }}
        >
          <IoWarning />
        </IconContext.Provider>
      </div>

      {/*Check Icon*/}
      <div
        style={{
          display: activityDanger === "completed" ? "block" : "none",
        }}
      >
        <IconContext.Provider
          value={{
            color: "black",
            size: isMobile ? "55px" : "40px",
          }}
        >
          <FaCheck />
        </IconContext.Provider>
      </div>

      <div
        style={{
          display: activityData.description ? "block" : "none",
          margin: "5px",
          textDecoration: "underline",
        }}
      >
        {activityData.description.length > 200
          ? activityData.description.substring(0, 200) + "..."
          : activityData.description}
      </div>

      <div style={{ margin: "10px", fontWeight: "bold" }}>
        Days Passed: {daysPassed}
      </div>
      {isOverdue ? (
        <div
          style={{
            ...commonStyles.calendar.activities.overdueOutline,
            color: "red",
            margin: "10px",
          }}
        >
          Overdue by {overdueDays} day(s)!
        </div>
      ) : (
        <div style={{ margin: "10px", fontWeight: "bold" }}>
          Days Remaining: {daysRemaining}
        </div>
      )}
    </div>
  );
};
