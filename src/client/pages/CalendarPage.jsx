import { useContext, useState, useEffect, useRef } from "react";
import { CurrentDateContext } from "../contexts/CurrentDateContext";
import { CurrentUserContext } from "../contexts/CurrentUserContext.jsx";
import { ThemeContext } from "../contexts/ThemeContext";
import { CalendarViewModeContext } from "../contexts/CalendarViewModeContext.jsx";
import {
  FaArrowLeft,
  FaArrowRight,
  FaSearchMinus,
  FaSearchPlus,
  FaExclamationCircle,
} from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import BlurredWindow from "../components/BlurredWindow";
import commonStyles from "../styles/commonStyles";
import PageTransition from "../components/PageTransition";
import fetchAllEventsData from "../data_fetching/fetchAllEventsData.js";
import fetchAllActivitiesData from "../data_fetching/fetchAllActivitiesData.js";
import postNewEvent from "../data_creation/postNewEvent.js";
import postNewActivity from "../data_creation/postNewActivity.js";
import FormSelect from "../components/FormSelect.jsx";
import { NewEventForm, DisplayEvents } from "../components/Events.jsx";
import {
  NewActivityForm,
  DisplayActivities,
  ActivitiesSummary,
} from "../components/Activities.jsx";

const CalendarPage = () => {
  const { theme } = useContext(ThemeContext);
  const { currentDate } = useContext(CurrentDateContext);
  const { currentUser } = useContext(CurrentUserContext);
  const { calendarViewMode, setCalendarViewMode } = useContext(
    CalendarViewModeContext,
  );

  const [calendarDate, setCalendarDate] = useState(currentDate);
  const [zoomLevel, setZoomLevel] = useState(1); // 0 year, 1 month, 2 week, 3 day
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 992,
  );
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [newEventCreateDate, setNewEventCreateDate] = useState(null);

  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [allEvents, setAllEvents] = useState([]);
  const [newActivityCreateDate, setNewActivityCreateDate] = useState(null);
  const [showNewActivityForm, setShowNewActivityForm] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickType, setQuickType] = useState("event");
  const [quickDate, setQuickDate] = useState(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickDesc, setQuickDesc] = useState("");
  const [quickNotify, setQuickNotify] = useState(false);
  const [quickTime, setQuickTime] = useState("09:00");
  const requestCalendarNotif = async () => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    try {
      await Notification.requestPermission();
    } catch {}
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `.global-hover:hover {background-color: ${theme === "dark" ? "#444444" : "#f0f0f0"} !important;}`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isMobile = windowWidth < 576;

  const [error, setError] = useState("");
  const [showErrorBanner, setShowErrorBanner] = useState(false);

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

  useEffect(() => {
    refetchEvents();
    refetchActivities();
  }, []);

  useEffect(() => {
    if (eventsData) {
      setAllEvents(eventsData.data);
    }
  }, [eventsData]);

  useEffect(() => {
    if (activitiesData) {
      setAllActivities(activitiesData.data);
    }
  }, [activitiesData]);

  // browser notifications
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (!currentUser) return;

    const EVENT_KEY = "cal_notif_events";
    const ACT_KEY = "cal_notif_activities";
    const getStore = (k) => {
      try {
        return JSON.parse(localStorage.getItem(k) || "{}");
      } catch {
        return {};
      }
    };
    const setStore = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    const playChime = () => {
      if (typeof window === "undefined" || !window.AudioContext) return;
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 700;
      oscillator.type = "sine";
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
    const send = (title, body) => {
      try {
        new Notification(title, { body });
        playChime();
      } catch {}
    };

    const checkAndNotify = () => {
      const now = Date.now();
      const evStore = getStore(EVENT_KEY);
      const actStore = getStore(ACT_KEY);

      // events
      const notifyEvents = getStore("notify_events");
      (allEvents || [])
        .filter((e) => e?.type === "basic" && e?.date && notifyEvents?.[e._id])
        .forEach((e) => {
          const when = new Date(e.date).getTime();
          const mins = Math.floor((when - now) / 60000);
          const steps = [1440, 60, 10, 0]; // times
          for (const step of steps) {
            const k = `${e._id}_${step}`;
            if (!evStore[k] && mins <= step) {
              const msg =
                step === 1440
                  ? "Event in 1 day"
                  : step === 60
                    ? "Event in 1 hour"
                    : step === 10
                      ? "Event in 10 minutes"
                      : "Event starting now";
              send(e.title || "Event", msg);
              evStore[k] = true;
              break;
            }
          }
        });

      // activities
      const notifyActs = getStore("notify_activities");
      (allActivities || [])
        .filter((a) => !a?.isCompleted && a?.endDate && notifyActs?.[a._id])
        .forEach((a) => {
          const deadline = new Date(a.endDate).getTime();
          const mins = Math.floor((deadline - now) / 60000);
          const steps = [1440, 360, 60, 30, 10, 1, 0]; // times
          for (const step of steps) {
            const k = `${a._id}_${step}`;
            if (!actStore[k] && mins <= step) {
              const msg =
                step === 1440
                  ? "Due in 1 day"
                  : step === 360
                    ? "Due in 6 hours"
                    : step === 60
                      ? "Due in 1 hour"
                      : step === 30
                        ? "Due in 30 minutes"
                        : step === 10
                          ? "Due in 10 minutes"
                          : step === 1
                            ? "Due in 1 minute"
                            : "Deadline now";
              send(a.title || "Activity", msg);
              actStore[k] = true;
              break;
            }
          }
        });

      setStore(EVENT_KEY, evStore);
      setStore(ACT_KEY, actStore);
    };

    checkAndNotify();
    const id = setInterval(checkAndNotify, 30000);
    return () => clearInterval(id);
  }, [allEvents, allActivities, currentUser]);

  // days in month
  const findMonthsDays = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  // first day of month (0-6)
  const findFirstDay = (year, month) => new Date(year, month, 0).getDay();
  // make monday = 0
  const remapDay = (day) => (day === 0 ? 6 : day - 1);
  // pick date
  const handleDateClick = (year, month, day) => {
    const newDate = new Date(year, month, day);
    setCalendarDate(newDate);
    if (
      selectedDate &&
      selectedDate.toDateString() === newDate.toDateString()
    ) {
      setSelectedDate(null);
    } else {
      setSelectedDate(newDate);
    }
  };
  // prev month
  const changeToPrevMonth = () => {
    const prevMonth = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() - 1,
      1,
    );
    setCalendarDate(prevMonth);
  };
  // next month
  const changeToNextMonth = () => {
    const nextMonth = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() + 1,
      1,
    );
    setCalendarDate(nextMonth);
  };
  // prev year
  const changeToPrevYear = () =>
    setCalendarDate(
      new Date(calendarDate.getFullYear() - 1, calendarDate.getMonth(), 1),
    );
  // next year
  const changeToNextYear = () =>
    setCalendarDate(
      new Date(calendarDate.getFullYear() + 1, calendarDate.getMonth(), 1),
    );
  // prev week
  const changeToPrevWeek = () =>
    setCalendarDate(
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth(),
        calendarDate.getDate() - 7,
      ),
    );
  // next week
  const changeToNextWeek = () =>
    setCalendarDate(
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth(),
        calendarDate.getDate() + 7,
      ),
    );
  // zoom -
  const decreaseZoomLevel = () => {
    if (zoomLevel > 0) setZoomLevel(zoomLevel - 1);
  };
  // zoom +
  const increaseZoomLevel = () => {
    if (zoomLevel < 3) setZoomLevel(zoomLevel + 1);
  };
  // prev day
  const changeToPrevDay = () =>
    setCalendarDate(
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth(),
        calendarDate.getDate() - 1,
      ),
    );
  // next day
  const changeToNextDay = () =>
    setCalendarDate(
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth(),
        calendarDate.getDate() + 1,
      ),
    );

  // Format helpers
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // month name
  const getMonthName = (month) => {
    if (isMobile) {
      const abbr = months[month].substring(0, 3);
      return abbr;
    }
    return months[month];
  };
  // month header
  const renderMonth = () =>
    `${getMonthName(calendarDate.getMonth())} ${calendarDate.getFullYear()}`;
  const monthName = (month) => getMonthName(month);

  // theme colors
  const calendarColors = commonStyles.calendar.colors;
  const themeColors =
    theme === "dark" ? calendarColors.dark : calendarColors.light;
  // responsive tweaks
  const responsiveStyles =
    commonStyles.getResponsiveStyles(windowWidth).calendar || {};

  const getBoxStyle = (date, isToday, isSelected, isOtherMonth = false) => {
    isSelected =
      selectedDate &&
      date &&
      date.toDateString() === selectedDate.toDateString();

    // box base
    const baseBoxStyle = {
      ...commonStyles.calendar.box.base(isMobile),
      ...(zoomLevel === 2 ? { minHeight: isMobile ? "50px" : "80px" } : {}),
    };
    // box state styles
    const boxStyle = {
      ...baseBoxStyle,
      ...(isSelected && {
        ...commonStyles.calendar.box.selected,
        backgroundColor: themeColors.selectedBg,
        borderColor: theme === "dark" ? "#ffffff" : "#003366",
      }),
      ...(isToday &&
        !isSelected && {
          ...commonStyles.calendar.box.today,
          backgroundColor: themeColors.todayBg,
          borderColor: "#0066cc",
        }),
      ...(!isToday &&
        !isSelected && {
          backgroundColor: isOtherMonth
            ? theme === "dark"
              ? "rgba(20, 20, 20, 0.7)"
              : themeColors.otherMonthBg
            : theme === "dark"
              ? "rgba(20, 20, 30, 0.7)"
              : themeColors.boxBg,
          borderColor:
            theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : themeColors.borderColor,
        }),
      ...(isOtherMonth &&
        !isSelected &&
        !isToday && {
          ...commonStyles.calendar.box.otherMonth,
        }),
      ...(responsiveStyles.box || {}),
      ...(theme === "dark" && {
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }),
    };
    // hover check
    const isHovered =
      hoveredDay && date && date.toDateString() === hoveredDay.toDateString();
    const hoverStyles = isHovered
      ? {
          backgroundColor:
            theme === "dark" ? "rgba(40, 40, 50, 0.8)" : "#f0f0f0",
          transform: isMobile ? "scale(1.02)" : "scale(1.05)",
          boxShadow:
            theme === "dark"
              ? "0 0 5px rgba(255,255,255,0.1)"
              : "0 0 5px rgba(0,0,0,0.1)",
        }
      : {};

    return {
      ...boxStyle,
      color:
        theme === "dark"
          ? isOtherMonth
            ? "#a0a0a0"
            : themeColors.textColor
          : "inherit",
      ...hoverStyles,
    };
  };

  const RenderCalendarEventsAndActivities = (props) => {
    const { i, date } = props;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          data-stop-calendar-click
          aria-label="Quick add"
          style={{
            ...commonStyles.calendar.events.buttonEventCreate(false),
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 18,
          }}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            try {
              setShowQuickCreate(true);
              setQuickType(
                calendarViewMode === "events" ? "event" : "activity",
              );
              setQuickDate(date);
              setQuickTitle("");
              setQuickDesc("");
              setQuickNotify(false);
              setQuickTime("09:00");
            } catch {}
          }}
        >
          <IconContext.Provider
            value={{
              color: theme === "dark" ? "white" : "black",
              size: isMobile ? "20px" : "22px",
            }}
          >
            <FaCirclePlus />
          </IconContext.Provider>
        </button>
        {calendarViewMode === "events" ? (
          <DisplayEvents
            data-stop-calendar-click
            allEvents={allEvents}
            date={date}
            isMobile={isMobile}
            remapDay={remapDay}
            error={error}
            setError={setError}
            refetchAll={refetchEvents}
            style={{ pointerEvents: "auto" }}
          />
        ) : (
          <DisplayActivities
            data-stop-calendar-click
            allActivities={allActivities}
            date={date}
            isMobile={isMobile}
            remapDay={remapDay}
            style={{ pointerEvents: "auto" }}
          />
        )}
      </div>
    );
  };

  // year view
  const renderYearCalendar = () => {
    const year = calendarDate.getFullYear();
    return months.map((month, i) => {
      const dateSelected = new Date(year, i, 1);

      const isSelected =
        selectedDate &&
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === i;

      const isToday =
        currentDate.getMonth() === i && currentDate.getFullYear() === year;

      return (
        <div key={`month-${i}`}>
          <div
            style={getBoxStyle(dateSelected, isToday, isSelected)}
            onClick={() => handleDateClick(year, i, 1)}
            onMouseEnter={() => setHoveredDay(new Date(year, i, 1))}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {monthName(i)}
          </div>
        </div>
      );
    });
  };

  // month view
  const renderMonthCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const totalDays = findMonthsDays(year, month);
    const firstDay = findFirstDay(year, month);
    let allDays = [];

    // week days
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
      const displayDay =
        windowWidth < 576
          ? day.charAt(0)
          : windowWidth < 768
            ? day
            : day === "Mon"
              ? "Monday"
              : day === "Tue"
                ? "Tuesday"
                : day === "Wed"
                  ? "Wednesday"
                  : day === "Thu"
                    ? "Thursday"
                    : day === "Fri"
                      ? "Friday"
                      : day === "Sat"
                        ? "Saturday"
                        : "Sunday";

      allDays.push(
        <div key={day} style={weekDayStyle}>
          {displayDay}
        </div>,
      );
    });
    // leading blanks
    for (let i = 0; i < firstDay; i++) {
      allDays.push(
        <div
          key={`empty-${i}`}
          style={{
            ...commonStyles.calendar.box.base(isMobile),
            backgroundColor: themeColors.emptyBg,
            minHeight: isMobile ? "35px" : "60px",
            borderRadius: "5px",
            ...(responsiveStyles.box || {}),
          }}
        ></div>,
      );
    }
    // days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);

      const isToday =
        currentDate.getDate() === i &&
        currentDate.getMonth() === month &&
        currentDate.getFullYear() === year;

      allDays.push(
        <div
          key={`day-${i}`}
          style={getBoxStyle(date, isToday, false)}
          onClick={(e) => {
            if (e.target.closest("[data-stop-calendar-click]")) return;
            handleDateClick(year, month, i);
          }}
          onMouseEnter={() => setHoveredDay(date)}
          onMouseLeave={() => setHoveredDay(null)}
        >
          {i}
          <RenderCalendarEventsAndActivities i={i} date={date} />
        </div>,
      );
    }

    return allDays;
  };
  // week view
  const renderWeekCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    let daysLeft = 7;
    const totalDays = findMonthsDays(year, month);
    let allDays = [];

    // week days
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
      const displayDay =
        windowWidth < 576
          ? day.charAt(0)
          : windowWidth < 768
            ? day
            : day === "Mon"
              ? "Monday"
              : day === "Tue"
                ? "Tuesday"
                : day === "Wed"
                  ? "Wednesday"
                  : day === "Thu"
                    ? "Thursday"
                    : day === "Fri"
                      ? "Friday"
                      : day === "Sat"
                        ? "Saturday"
                        : "Sunday";

      allDays.push(
        <div key={day} style={weekDayStyle}>
          {displayDay}
        </div>,
      );
    });

    // start of week
    let firstWeekDay = calendarDate.getDate() - remapDay(calendarDate.getDay());
    if (firstWeekDay < 1) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const prevMonthDays = findMonthsDays(prevYear, prevMonth);

      // prev month
      for (let i = prevMonthDays + firstWeekDay; i <= prevMonthDays; i++) {
        const date = new Date(prevYear, prevMonth, i);
        const isToday =
          currentDate.getDate() === i &&
          currentDate.getMonth() === prevMonth &&
          currentDate.getFullYear() === prevYear;

        allDays.push(
          <div
            key={`prev-${i}`}
            style={getBoxStyle(date, isToday, false, true)}
            onClick={() => handleDateClick(prevYear, prevMonth, i)}
            onMouseEnter={() => setHoveredDay(date)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {i}
            <RenderCalendarEventsAndActivities i={i} date={date} />
          </div>,
        );
        daysLeft--;
      }

      // current month
      for (let i = 1; i <= daysLeft; i++) {
        const date = new Date(year, month, i);
        const isToday =
          currentDate.getDate() === i &&
          currentDate.getMonth() === month &&
          currentDate.getFullYear() === year;

        allDays.push(
          <div
            key={`day-${i}`}
            style={getBoxStyle(date, isToday, false)}
            onClick={(e) => {
              if (e.target.closest("[data-stop-calendar-click]")) return;
              handleDateClick(year, month, i);
            }}
            onMouseEnter={() => setHoveredDay(date)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {i}
            <RenderCalendarEventsAndActivities i={i} date={date} />
          </div>,
        );
      }
    } else {
      // fill this week
      let dayCount = 1;
      for (let i = firstWeekDay; dayCount <= 7 && i <= totalDays; i++) {
        const date = new Date(year, month, i);
        const isToday =
          currentDate.getDate() === i &&
          currentDate.getMonth() === month &&
          currentDate.getFullYear() === year;

        allDays.push(
          <div
            key={`day-${i}`}
            style={getBoxStyle(date, isToday, false)}
            onClick={() => handleDateClick(year, month, i)}
            onMouseEnter={() => setHoveredDay(date)}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {i}
            <RenderCalendarEventsAndActivities i={i} date={date} />
          </div>,
        );
        dayCount++;
      }

      // next month
      if (dayCount <= 7) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        for (let i = 1; dayCount <= 7; i++, dayCount++) {
          const date = new Date(nextYear, nextMonth, i);
          const isToday =
            currentDate.getDate() === i &&
            currentDate.getMonth() === nextMonth &&
            currentDate.getFullYear() === nextYear;

          allDays.push(
            <div
              key={`next-${i}`}
              style={getBoxStyle(date, isToday, false, true)}
              onClick={() => handleDateClick(nextYear, nextMonth, i)}
              onMouseEnter={() => setHoveredDay(date)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {i}
              <RenderCalendarEventsAndActivities i={i} date={date} />
            </div>,
          );
        }
      }
    }

    return allDays;
  };
  // nav button style
  const getButtonStyle = (buttonId) => {
    const isHovered = hoveredButton === buttonId;
    const isDisabled =
      (buttonId === "decreaseZoom" && zoomLevel === 0) ||
      (buttonId === "increaseZoom" && zoomLevel === 3);

    const baseStyle = commonStyles.calendar.button(
      theme,
      isHovered,
      isDisabled,
    );
    if (isMobile) {
      return {
        ...baseStyle,
        padding: "4px 8px",
        fontSize: "12px",
        minWidth: "auto",
      };
    }
    return baseStyle;
  };
  // grid style
  const calendarContainerStyle = {
    ...(zoomLevel === 0
      ? commonStyles.calendar.container.year
      : zoomLevel === 1
        ? commonStyles.calendar.container.month
        : zoomLevel === 2
          ? commonStyles.calendar.container.week
          : {
              display: "grid",
              gridTemplateColumns: "1fr",
              gridTemplateRows: "auto",
              gap: "5px",
              padding: "10px",
              borderRadius: "10px",
              width: "100%",
              maxWidth: "800px",
              margin: "0 auto",
            }),
    ...commonStyles.blurredBackdrop(theme),
    ...(responsiveStyles.container || {}),
    ...(zoomLevel === 0 && responsiveStyles.yearGrid
      ? { gridTemplateColumns: responsiveStyles.yearGrid.gridTemplateColumns }
      : {}),
    gap: isMobile ? "1px" : "5px",
  };
  // button row
  const ButtonContainer = ({ children }) => (
    <div
      style={{
        ...commonStyles.calendar.buttonContainer,
        flexWrap: "wrap",
        justifyContent: "center",
        gap: isMobile ? "5px" : "10px",
      }}
    >
      {children}
    </div>
  );
  // week day header
  const weekDayStyle = {
    ...commonStyles.calendar.header.weekDay,
    ...(responsiveStyles.weekDay || {}),
    color: theme === "dark" ? themeColors.textColor : "#333333",
    padding: isMobile ? "2px" : "5px",
    fontSize: isMobile ? "10px" : "14px",
  };
  // month label
  const monthNameStyle = {
    ...commonStyles.calendar.header.monthName,
    ...(responsiveStyles.monthName || {}),
    color: theme === "dark" ? themeColors.textColor : "inherit",
    fontSize: isMobile ? "16px" : "20px",
  };

  // day view
  const renderDayCalendar = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const day = calendarDate.getDate();
    const date = new Date(year, month, day);

    const isToday =
      currentDate.getDate() === day &&
      currentDate.getMonth() === month &&
      currentDate.getFullYear() === year;

    return [
      <div key={`day-header`} style={weekDayStyle}>
        {date.toLocaleDateString(undefined, {
          weekday: isMobile ? "short" : "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>,
      <div
        key={`day-box`}
        style={{
          ...getBoxStyle(date, isToday, false),
          minHeight: isMobile ? "120px" : "200px",
        }}
        onClick={() => handleDateClick(year, month, day)}
        onMouseEnter={() => setHoveredDay(date)}
        onMouseLeave={() => setHoveredDay(null)}
      >
        {day}
        <RenderCalendarEventsAndActivities i={day} date={date} />
      </div>,
    ];
  };

  return (
    <PageTransition>
      <div>
        <BlurredWindow
          width={isMobile ? "95%" : "850px"}
          padding={isMobile ? "10px" : "20px"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={commonStyles.calendar.header.title}>
              <h1
                style={{
                  ...commonStyles.welcomeGradient(theme),
                  fontSize: isMobile ? "24px" : "32px",
                }}
                key={theme}
              >
                Calendar
              </h1>
            </div>
            {typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission !== "granted" && (
                <button
                  onClick={requestCalendarNotif}
                  style={{
                    ...commonStyles.calendar.button(theme, false, false),
                    marginLeft: "auto",
                  }}
                >
                  Enable Notifications
                </button>
              )}
          </div>

          <div style={{ margin: "10px 0", textAlign: "center" }}>
            <FormSelect
              value={calendarViewMode}
              onChange={(e) => setCalendarViewMode(e.target.value)}
            >
              <option value="events">Events</option>
              <option value="activities">Activities</option>
            </FormSelect>
          </div>

          <div style={monthNameStyle}>
            {zoomLevel === 0 ? calendarDate.getFullYear() : renderMonth()}
          </div>

          {(!showNewEventForm || !showNewActivityForm) && (
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

          {calendarViewMode === "events" ? (
            <NewEventForm
              showForm={showNewEventForm}
              setShowForm={setShowNewEventForm}
              refetchAllEventsData={refetchEvents}
              date={newEventCreateDate}
              setShowErrorBanner={setShowErrorBanner}
              showErrorBanner={showErrorBanner}
              setError={setError}
              error={error}
            />
          ) : (
            <NewActivityForm
              showForm={showNewActivityForm}
              setShowForm={setShowNewActivityForm}
              refetchAllActivitiesData={refetchActivities}
              endDate={newActivityCreateDate}
              setShowErrorBanner={setShowErrorBanner}
              showErrorBanner={showErrorBanner}
              setError={setError}
              error={error}
            />
          )}

          {/* create popup */}
          {showQuickCreate && (
            <div
              style={commonStyles.notes.newNoteFormOverlay}
              onClick={() => setShowQuickCreate(false)}
            >
              <div
                style={commonStyles.notes.newNoteFormContainer(
                  theme,
                  typeof window !== "undefined" ? window.innerHeight : 600,
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  {quickType === "event" ? "New Event" : "New Activity"}
                </div>
                <input
                  type="text"
                  placeholder="Title"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    marginBottom: "6px",
                  }}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "6px",
                    marginBottom: "6px",
                  }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    opacity: 0.8,
                    marginBottom: "8px",
                  }}
                >
                  {quickType === "event"
                    ? `Date: ${new Date(quickDate).toLocaleDateString()} at ${quickTime}`
                    : `Ends: ${new Date(quickDate).toLocaleDateString()}`}
                </div>
                {quickType === "event" && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      margin: "6px 0",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ minWidth: 40, textAlign: "right" }}>
                      Time
                    </span>
                    <input
                      type="time"
                      value={quickTime}
                      onChange={(e) => setQuickTime(e.target.value)}
                      style={{ padding: "6px", borderRadius: 6 }}
                    />
                  </label>
                )}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    margin: "6px 0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={quickNotify}
                    onChange={(e) => setQuickNotify(e.target.checked)}
                  />
                  Notify me (browser notification)
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    justifyContent: "center",
                    marginTop: "8px",
                  }}
                >
                  <button
                    style={commonStyles.calendar.button(theme)}
                    onClick={async () => {
                      if (!quickTitle || !quickDate || !currentUser) return;
                      try {
                        if (quickType === "event") {
                          const [hh, mm] = (quickTime || "09:00")
                            .split(":")
                            .map((n) => parseInt(n, 10));
                          const eventDate = new Date(quickDate);
                          if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
                            eventDate.setHours(hh, mm, 0, 0);
                          }
                          const res = await postNewEvent({
                            title: quickTitle,
                            description: quickDesc || undefined,
                            date: eventDate,
                            type: "basic",
                            userID: currentUser,
                          });
                          const id = res?.data?._id;
                          if (id) {
                            const key = "notify_events";
                            const store = JSON.parse(
                              localStorage.getItem(key) || "{}",
                            );
                            store[id] = !!quickNotify;
                            localStorage.setItem(key, JSON.stringify(store));
                          }
                          if (
                            quickNotify &&
                            typeof window !== "undefined" &&
                            "Notification" in window
                          ) {
                            Notification.requestPermission?.();
                          }
                          refetchEvents();
                        } else {
                          const res = await postNewActivity({
                            title: quickTitle,
                            description: quickDesc || undefined,
                            startDate: currentDate,
                            endDate: new Date(
                              new Date(quickDate).toDateString(),
                            ),
                            userID: currentUser,
                          });
                          const id = res?.data?._id;
                          if (id) {
                            const key = "notify_activities";
                            const store = JSON.parse(
                              localStorage.getItem(key) || "{}",
                            );
                            store[id] = !!quickNotify;
                            localStorage.setItem(key, JSON.stringify(store));
                          }
                          if (
                            quickNotify &&
                            typeof window !== "undefined" &&
                            "Notification" in window
                          ) {
                            Notification.requestPermission?.();
                          }
                          refetchActivities();
                        }
                        setShowQuickCreate(false);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >
                    Create
                  </button>
                  <button
                    style={commonStyles.calendar.button(theme)}
                    onClick={() => setShowQuickCreate(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <ButtonContainer>
            {zoomLevel === 0 && (
              <>
                <button
                  className="global-hover"
                  style={getButtonStyle("prevYear")}
                  onClick={changeToPrevYear}
                  onMouseEnter={() => setHoveredButton("prevYear")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <FaArrowLeft /> {isMobile ? "Prev" : "Previous Year"}
                </button>
                <button
                  className="global-hover"
                  style={getButtonStyle("nextYear")}
                  onClick={changeToNextYear}
                  onMouseEnter={() => setHoveredButton("nextYear")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {isMobile ? "Next" : "Next Year"} <FaArrowRight />
                </button>
              </>
            )}

            {zoomLevel === 1 && (
              <>
                <button
                  style={getButtonStyle("prevMonth")}
                  onClick={changeToPrevMonth}
                  onMouseEnter={() => setHoveredButton("prevMonth")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <FaArrowLeft /> {isMobile ? "Prev" : "Previous Month"}
                </button>
                <button
                  style={getButtonStyle("nextMonth")}
                  onClick={changeToNextMonth}
                  onMouseEnter={() => setHoveredButton("nextMonth")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {isMobile ? "Next" : "Next Month"} <FaArrowRight />
                </button>
              </>
            )}

            {zoomLevel === 2 && (
              <>
                <button
                  className="global-hover"
                  style={getButtonStyle("prevWeek")}
                  onClick={changeToPrevWeek}
                  onMouseEnter={() => setHoveredButton("prevWeek")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <FaArrowLeft /> {isMobile ? "Prev" : "Previous Week"}
                </button>
                <button
                  className="global-hover"
                  style={getButtonStyle("nextWeek")}
                  onClick={changeToNextWeek}
                  onMouseEnter={() => setHoveredButton("nextWeek")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {isMobile ? "Next" : "Next Week"} <FaArrowRight />
                </button>
              </>
            )}
            {zoomLevel === 3 && (
              <>
                <button
                  className="global-hover"
                  style={getButtonStyle("prevDay")}
                  onClick={changeToPrevDay}
                  onMouseEnter={() => setHoveredButton("prevDay")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <FaArrowLeft /> {isMobile ? "Prev" : "Previous Day"}
                </button>
                <button
                  className="global-hover"
                  style={getButtonStyle("nextDay")}
                  onClick={changeToNextDay}
                  onMouseEnter={() => setHoveredButton("nextDay")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {isMobile ? "Next" : "Next Day"} <FaArrowRight />
                </button>
              </>
            )}
          </ButtonContainer>

          <ButtonContainer>
            <button
              className="global-hover"
              style={getButtonStyle("decreaseZoom")}
              onClick={decreaseZoomLevel}
              disabled={zoomLevel === 0}
              onMouseEnter={() => setHoveredButton("decreaseZoom")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaSearchMinus /> {isMobile ? "Zoom -" : "Decrease Zoom"}
            </button>
            <button
              className="global-hover"
              style={getButtonStyle("increaseZoom")}
              onClick={increaseZoomLevel}
              disabled={zoomLevel === 3}
              onMouseEnter={() => setHoveredButton("increaseZoom")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <FaSearchPlus /> {isMobile ? "Zoom +" : "Increase Zoom"}
            </button>
          </ButtonContainer>

          <div
            style={{
              ...commonStyles.calendar.container.outer,
              padding: isMobile ? "2px" : "10px",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <div style={calendarContainerStyle}>
              {zoomLevel === 0 && renderYearCalendar()}
              {zoomLevel === 1 && renderMonthCalendar()}
              {zoomLevel === 2 && renderWeekCalendar()}
              {zoomLevel === 3 && renderDayCalendar()}
            </div>
          </div>

          {calendarViewMode === "activities" && (
            <div
              style={{
                width: "100%",
                display: allActivities.length ? "block" : "none",
              }}
            >
              <ActivitiesSummary
                activities={allActivities}
                refetchAllActivitiesData={refetchActivities}
                isMobile={isMobile}
                setError={setError}
                setShowErrorBanner={setShowErrorBanner}
              />
            </div>
          )}
        </BlurredWindow>
      </div>
    </PageTransition>
  );
};

export default CalendarPage;
