import { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrentDateContext } from "../contexts/CurrentDateContext";
import { CurrentUserContext } from "../contexts/CurrentUserContext.jsx";
import BlurredWindow from "../components/BlurredWindow";
import PageTransition from "../components/PageTransition";
import commonStyles from "../styles/commonStyles";
import { FaPlay, FaPause, FaStop, FaRedo, FaCog } from "react-icons/fa";
import { IconContext } from "react-icons";
import postNewEvent from "../data_creation/postNewEvent.js";

const PomodoroPage = () => {
  const { theme } = useContext(ThemeContext);
  const { currentDate } = useContext(CurrentDateContext);
  const { currentUser } = useContext(CurrentUserContext);
  const [isMobile, setIsMobile] = useState(false);

  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState("work");
  const [sessionCount, setSessionCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const [workDuration, setWorkDuration] = useState(30);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);

  const intervalRef = useRef(null);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [plannedSessions, setPlannedSessions] = useState([]);
  const [planInfo, setPlanInfo] = useState("");

  const STORAGE_KEY = "pomodoro_timer_state";

  useEffect(() => {
    const f = () => setIsMobile(window.innerWidth <= 768);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);

        if (state.isRunning && state.endTime) {
          const now = currentDate.getTime();
          const remainingMs = state.endTime - now;
          const newTimeLeft = Math.max(0, Math.ceil(remainingMs / 1000));

          if (newTimeLeft > 0) {
            setTimeLeft(newTimeLeft);
            setIsRunning(true);
            setSessionType(state.sessionType);
            setSessionCount(state.sessionCount);
            setStartTime(state.startTime);
            setEndTime(state.endTime);
          } else {
            setIsRunning(false);
            setEndTime(null);

            if (state.sessionType === "work") {
              const newCount = state.sessionCount + 1;
              setSessionCount(newCount);

              const isLongBreak = newCount % longBreakInterval === 0;
              const breakDuration = isLongBreak
                ? longBreakDuration
                : shortBreakDuration;

              setSessionType("break");
              setTimeLeft(breakDuration * 60);
            } else {
              setSessionType("work");
              setTimeLeft(workDuration * 60);
              setSessionCount(state.sessionCount);
            }
            setStartTime(null);
          }
        } else {
          setTimeLeft(state.timeLeft || 30 * 60);
          setIsRunning(false);
          setSessionType(state.sessionType || "work");
          setSessionCount(state.sessionCount || 0);
        }

        if (state.settings) {
          setWorkDuration(state.settings.workDuration || 30);
          setShortBreakDuration(state.settings.shortBreakDuration || 5);
          setLongBreakDuration(state.settings.longBreakDuration || 15);
          setLongBreakInterval(state.settings.longBreakInterval || 4);
        }
      } catch (error) {
        console.error("Error loading pomodoro state:", error);
      }
    }
  }, []);

  useEffect(() => {
    const state = {
      timeLeft,
      isRunning,
      sessionType,
      sessionCount,
      startTime,
      endTime,
      settings: {
        workDuration,
        shortBreakDuration,
        longBreakDuration,
        longBreakInterval,
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [
    timeLeft,
    isRunning,
    sessionType,
    sessionCount,
    startTime,
    endTime,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
  ]);

  useEffect(() => {
    if (!isRunning || !endTime) return;
    const id = setInterval(() => {
      const now = currentDate.getTime();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        setIsRunning(false);
        setEndTime(null);
        handleSessionComplete();
      }
    }, 250);
    return () => clearInterval(id);
  }, [isRunning, endTime, currentDate]);

  const handleSessionComplete = () => {
    playNotificationSound();
    // browser notification
    const isWorkJustFinished = sessionType === "work";
    const title = isWorkJustFinished
      ? "Pomodoro: Study session is done"
      : "Pomodoro: Break finished";
    const body = isWorkJustFinished
      ? "Nice job. Time for a break."
      : "Break's over. Back to work.";
    sendBrowserNotification(title, body);

    if (sessionType === "work") {
      const newCount = sessionCount + 1;
      setSessionCount(newCount);

      const isLongBreak = newCount % longBreakInterval === 0;
      const breakDuration = isLongBreak
        ? longBreakDuration
        : shortBreakDuration;

      setSessionType("break");
      setTimeLeft(breakDuration * 60);
    } else {
      setSessionType("work");
      setTimeLeft(workDuration * 60);
    }

    setStartTime(null);
    setEndTime(null);
  };

  const playNotificationSound = () => {
    if (typeof window !== "undefined" && window.AudioContext) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = sessionType === "work" ? 800 : 600;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const NOTIF_STATUS_KEY = "pomodoro_notif_status";
  const requestNotificationPermission = async () => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    try {
      const res = await Notification.requestPermission();
      if (res) localStorage.setItem(NOTIF_STATUS_KEY, res);
      return res;
    } catch (_) {
      return undefined;
    }
  };

  const sendBrowserNotification = (title, body) => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        new Notification(title, { body });
      } catch (_) {}
    }
  };

  // plan sessions
  const planSessions = () => {
    const total = parseInt(totalStudyMinutes);
    if (!total || total <= 0) {
      setPlannedSessions([]);
      setPlanInfo("");
      return;
    }

    const start = scheduleStart ? new Date(scheduleStart) : new Date();
    if (isNaN(start.getTime())) {
      setPlannedSessions([]);
      setPlanInfo("");
      return;
    }

    let remaining = total;
    let current = new Date(start);
    let sessions = [];
    let count = 0;

    while (remaining >= workDuration) {
      const s = new Date(current);
      const e = new Date(current.getTime() + workDuration * 60000);
      sessions.push({ start: s, end: e });
      remaining -= workDuration;
      count++;

      const isLong = count % longBreakInterval === 0;
      const bd = isLong ? longBreakDuration : shortBreakDuration;
      current = new Date(e.getTime() + bd * 60000);
    }

    setPlannedSessions(sessions);
    setPlanInfo(`${sessions.length} sessions of ${workDuration} min`);
  };

  const [isScheduling, setIsScheduling] = useState(false);
  const createEvent = async ({ title, date, eventEnd }) => {
    return await postNewEvent({
      title,
      date,
      eventEnd,
      type: "basic",
      userID: currentUser,
    });
  };

  const scheduleToCalendar = async () => {
    if (!currentUser || !plannedSessions.length) return;
    setIsScheduling(true);
    try {
      for (const [idx, s] of plannedSessions.entries()) {
        await createEvent({
          title: `Study Session #${idx + 1}`,
          date: s.start,
          eventEnd: s.end,
        });
      }
      setPlanInfo(`Added ${plannedSessions.length} sessions to calendar`);
    } catch (e) {
      setPlanInfo("Couldn't add to calendar");
    } finally {
      setIsScheduling(false);
    }
  };

  const startTimer = () => {
    // ask permission on user click
    requestNotificationPermission();
    const now = currentDate.getTime();
    const sessionEndTime = now + timeLeft * 1000;

    setIsRunning(true);
    setStartTime(now - (getDurationInSeconds() - timeLeft) * 1000);
    setEndTime(sessionEndTime);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setStartTime(null);
    setEndTime(null);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationInSeconds());
    setStartTime(null);
    setEndTime(null);
  };

  const resetAllStats = () => {
    setIsRunning(false);
    setStartTime(null);
    setEndTime(null);

    setSessionType("work");
    setTimeLeft(workDuration * 60);

    setSessionCount(0);

    localStorage.removeItem(STORAGE_KEY);
  };

  const skipSession = () => {
    setIsRunning(false);
    setEndTime(null);
    handleSessionComplete();
  };

  const getDurationInSeconds = () => {
    if (sessionType === "work") {
      return workDuration * 60;
    } else {
      const isLongBreak = sessionCount % longBreakInterval === 0;
      return (isLongBreak ? longBreakDuration : shortBreakDuration) * 60;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    const total = getDurationInSeconds();
    return ((total - timeLeft) / total) * 100;
  };

  const getSessionTypeDisplay = () => {
    if (sessionType === "work") {
      return "Study Session";
    } else {
      const isLongBreak = sessionCount % longBreakInterval === 0;
      return isLongBreak ? "Long Break" : "Short Break";
    }
  };

  const [hoveredBtn, setHoveredBtn] = useState(null);
  const btn = (id, disabled = false) => {
    const base = commonStyles.calendar.button(
      theme,
      hoveredBtn === id,
      disabled,
    );
    return isMobile
      ? { ...base, padding: "6px 10px", fontSize: "12px", minWidth: "auto" }
      : base;
  };

  return (
    <PageTransition>
      <div style={{ color: theme === "dark" ? "white" : "black" }}>
        <BlurredWindow
          width={isMobile ? "95%" : "850px"}
          padding={isMobile ? "10px" : "20px"}
        >
          <div style={commonStyles.calendar.header.title}>
            <h1
              style={{
                ...commonStyles.welcomeGradient(theme),
                fontSize: isMobile ? "24px" : "32px",
              }}
              key={theme}
            >
              Pomodoro
            </h1>
          </div>

          {/* settings */}
          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={btn("settings")}
              onMouseEnter={() => setHoveredBtn("settings")}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              <IconContext.Provider
                value={{ size: isMobile ? "14px" : "16px" }}
              >
                <FaCog />
              </IconContext.Provider>
              {!isMobile && " Settings"}
            </button>
          </div>
          {/* settings panel */}
          {showSettings && (
            <div
              style={{
                backgroundColor:
                  theme === "dark"
                    ? "rgba(45, 55, 72, 0.8)"
                    : "rgba(237, 242, 247, 0.8)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "30px",
                border:
                  theme === "dark"
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "1px solid rgba(0,0,0,0.1)",
              }}
            >
              <h3
                style={{
                  marginBottom: "15px",
                  fontSize: isMobile ? "16px" : "18px",
                }}
              >
                Timer Settings
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                  gap: "15px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    Work Duration (minutes):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={workDuration}
                    onChange={(e) =>
                      setWorkDuration(parseInt(e.target.value) || 1)
                    }
                    disabled={isRunning}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border:
                        theme === "dark"
                          ? "1px solid #4a5568"
                          : "1px solid #e2e8f0",
                      backgroundColor: theme === "dark" ? "#2d3748" : "white",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    Short Break (minutes):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={shortBreakDuration}
                    onChange={(e) =>
                      setShortBreakDuration(parseInt(e.target.value) || 1)
                    }
                    disabled={isRunning}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border:
                        theme === "dark"
                          ? "1px solid #4a5568"
                          : "1px solid #e2e8f0",
                      backgroundColor: theme === "dark" ? "#2d3748" : "white",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    Long Break (minutes):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={longBreakDuration}
                    onChange={(e) =>
                      setLongBreakDuration(parseInt(e.target.value) || 1)
                    }
                    disabled={isRunning}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border:
                        theme === "dark"
                          ? "1px solid #4a5568"
                          : "1px solid #e2e8f0",
                      backgroundColor: theme === "dark" ? "#2d3748" : "white",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    Long Break Every (sessions):
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={longBreakInterval}
                    onChange={(e) =>
                      setLongBreakInterval(parseInt(e.target.value) || 2)
                    }
                    disabled={isRunning}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border:
                        theme === "dark"
                          ? "1px solid #4a5568"
                          : "1px solid #e2e8f0",
                      backgroundColor: theme === "dark" ? "#2d3748" : "white",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <button
                  onClick={() => {
                    if (!isRunning) {
                      setTimeLeft(
                        sessionType === "work"
                          ? workDuration * 60
                          : (sessionCount % longBreakInterval === 0
                              ? longBreakDuration
                              : shortBreakDuration) * 60,
                      );
                    }
                  }}
                  disabled={isRunning}
                  style={btn("apply", isRunning)}
                  onMouseEnter={() => setHoveredBtn("apply")}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  Apply Settings
                </button>
              </div>
              {/* notifications */}
              <div style={{ marginTop: "18px" }}>
                <h3
                  style={{
                    marginBottom: "10px",
                    fontSize: isMobile ? "16px" : "18px",
                  }}
                >
                  Notifications
                </h3>
                <div>
                  {(() => {
                    const perm =
                      typeof window === "undefined"
                        ? "unknown"
                        : !("Notification" in window)
                          ? "unsupported"
                          : Notification.permission;
                    if (perm === "unsupported") {
                      return (
                        <div style={{ opacity: 0.8, fontSize: "14px" }}>
                          Your browser doesn't support notifications
                        </div>
                      );
                    }
                    return (
                      <>
                        <button
                          onClick={requestNotificationPermission}
                          style={btn("enableNotif", perm === "granted")}
                          onMouseEnter={() => setHoveredBtn("enableNotif")}
                          onMouseLeave={() => setHoveredBtn(null)}
                          disabled={perm === "granted"}
                        >
                          {perm === "granted"
                            ? "Notifications Enabled"
                            : "Enable Notifications"}
                        </button>
                        {typeof window !== "undefined" &&
                          !window.isSecureContext && (
                            <div
                              style={{
                                marginTop: "6px",
                                opacity: 0.8,
                                fontSize: "12px",
                              }}
                            ></div>
                          )}
                        {perm === "denied" && (
                          <div
                            style={{
                              marginTop: "6px",
                              opacity: 0.8,
                              fontSize: "12px",
                            }}
                          >
                            Notifications are blocked. Use the site settings in
                            your browser to allow them
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* study sessions */}
              <h3
                style={{
                  marginTop: "20px",
                  marginBottom: "10px",
                  fontSize: isMobile ? "16px" : "18px",
                }}
              >
                Plan Study Sessions
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "10px",
                  alignItems: "end",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    Total study minutes:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalStudyMinutes}
                    onChange={(e) => setTotalStudyMinutes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border:
                        theme === "dark"
                          ? "1px solid #4a5568"
                          : "1px solid #e2e8f0",
                      backgroundColor: theme === "dark" ? "#2d3748" : "white",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    Start date & time:
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleStart}
                    onChange={(e) => setScheduleStart(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border:
                        theme === "dark"
                          ? "1px solid #4a5568"
                          : "1px solid #e2e8f0",
                      backgroundColor: theme === "dark" ? "#2d3748" : "white",
                      color: theme === "dark" ? "white" : "black",
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={planSessions}
                  style={btn("plan")}
                  onMouseEnter={() => setHoveredBtn("plan")}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  Plan
                </button>
                <button
                  onClick={scheduleToCalendar}
                  style={btn(
                    "schedule",
                    isScheduling || !plannedSessions.length,
                  )}
                  disabled={isScheduling || !plannedSessions.length}
                  onMouseEnter={() => setHoveredBtn("schedule")}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  {isScheduling ? "Adding..." : "Add to Calendar"}
                </button>
              </div>
              {planInfo && (
                <div
                  style={{ marginTop: "8px", opacity: 0.8, fontSize: "14px" }}
                >
                  {planInfo}
                </div>
              )}
            </div>
          )}
          {/* session info */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                fontSize: isMobile ? "18px" : "24px",
                marginBottom: "10px",
                color: theme === "dark" ? "#e2e8f0" : "#2d3748",
              }}
            >
              {getSessionTypeDisplay()}
            </h2>
            <p
              style={{
                fontSize: isMobile ? "14px" : "16px",
                opacity: 0.8,
                marginBottom: "5px",
              }}
            >
              Session {sessionCount + 1} • Completed: {sessionCount}
            </p>
            {startTime && (
              <p
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  opacity: 0.6,
                }}
              >
                Started: {new Date(startTime).toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* pomodoro timer */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: isMobile ? "200px" : "250px",
                height: isMobile ? "200px" : "250px",
              }}
            >
              <svg
                width="100%"
                height="100%"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke={theme === "dark" ? "#4a5568" : "#e2e8f0"}
                  strokeWidth="8"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke={theme === "dark" ? "#718096" : "#4a5568"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}%`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}%`}
                  style={{
                    transition: "stroke-dashoffset 1s ease-in-out",
                  }}
                />
              </svg>

              {/* timer display */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: isMobile ? "32px" : "48px",
                    fontWeight: "bold",
                    marginBottom: "5px",
                  }}
                >
                  {formatTime(timeLeft)}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? "12px" : "14px",
                    opacity: 0.7,
                  }}
                >
                  {Math.round(getProgress())}% Complete
                </div>
              </div>
            </div>
          </div>
          {/* controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <IconContext.Provider
              value={{
                size: isMobile ? "16px" : "18px",
                style: { marginRight: isMobile ? "0px" : "8px" },
              }}
            >
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  style={btn("start", timeLeft === 0)}
                  onMouseEnter={() => setHoveredBtn("start")}
                  onMouseLeave={() => setHoveredBtn(null)}
                  disabled={timeLeft === 0}
                >
                  <FaPlay />
                  {!isMobile && " Start"}
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  style={btn("pause")}
                  onMouseEnter={() => setHoveredBtn("pause")}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  <FaPause />
                  {!isMobile && " Pause"}
                </button>
              )}

              <button
                onClick={resetAllStats}
                style={btn("reset")}
                onMouseEnter={() => setHoveredBtn("reset")}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                <FaRedo />
                {!isMobile && " Reset"}
              </button>

              <button
                onClick={skipSession}
                style={btn("skip", timeLeft === 0)}
                onMouseEnter={() => setHoveredBtn("skip")}
                onMouseLeave={() => setHoveredBtn(null)}
                disabled={timeLeft === 0}
              >
                <FaStop />
                {!isMobile && " Skip"}
              </button>
            </IconContext.Provider>
          </div>
          {/* stats */}
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              backgroundColor:
                theme === "dark"
                  ? "rgba(45, 55, 72, 0.3)"
                  : "rgba(237, 242, 247, 0.3)",
              borderRadius: "12px",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            <p style={{ marginBottom: "10px" }}>
              <strong>Today's Progress:</strong>
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: "15px",
                textAlign: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: isMobile ? "20px" : "24px",
                    fontWeight: "bold",
                  }}
                >
                  {sessionCount}
                </div>
                <div
                  style={{ opacity: 0.7, fontSize: isMobile ? "12px" : "14px" }}
                >
                  Completed Sessions
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: isMobile ? "20px" : "24px",
                    fontWeight: "bold",
                  }}
                >
                  {Math.floor((sessionCount * workDuration) / 60)}h{" "}
                  {(sessionCount * workDuration) % 60}m
                </div>
                <div
                  style={{ opacity: 0.7, fontSize: isMobile ? "12px" : "14px" }}
                >
                  Study Time
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: isMobile ? "20px" : "24px",
                    fontWeight: "bold",
                  }}
                >
                  {sessionType === "work" ? "Working" : "Break"}
                </div>
                <div
                  style={{ opacity: 0.7, fontSize: isMobile ? "12px" : "14px" }}
                >
                  Current Status
                </div>
              </div>
            </div>
          </div>
        </BlurredWindow>
      </div>
    </PageTransition>
  );
};

export default PomodoroPage;
