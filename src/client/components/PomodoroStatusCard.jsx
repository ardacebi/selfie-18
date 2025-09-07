import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import BlurredWindow from "./BlurredWindow";
import { FaClock, FaPlay, FaPause } from "react-icons/fa";
import { IconContext } from "react-icons";

export const PomodoroStatusCard = ({ isMobile }) => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [pomodoroState, setPomodoroState] = useState(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const loadPomodoroState = () => {
      try {
        const savedState = localStorage.getItem("pomodoro_timer_state");
        if (savedState) {
          const state = JSON.parse(savedState);

          if (state.isRunning && state.endTime) {
            // Calculate
            const now = Date.now();
            const remainingMs = state.endTime - now;
            const timeLeft = Math.max(0, Math.ceil(remainingMs / 1000));

            setPomodoroState({
              ...state,
              timeLeft: timeLeft,
              isRunning: timeLeft > 0 && state.isRunning,
            });
          } else {
            setPomodoroState(state);
          }
        } else {
          setPomodoroState({
            timeLeft: 30 * 60,
            isRunning: false,
            sessionType: "work",
            sessionCount: 0,
          });
        }
      } catch (error) {
        console.error("Error loading pomodoro state:", error);
        setPomodoroState({
          timeLeft: 30 * 60,
          isRunning: false,
          sessionType: "work",
          sessionCount: 0,
        });
      }
    };

    loadPomodoroState();

    const interval = setInterval(loadPomodoroState, 1000);

    return () => clearInterval(interval);
  }, []);

  // time format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getSessionTypeDisplay = () => {
    if (!pomodoroState) return "Study Session";

    if (pomodoroState.sessionType === "work") {
      return "Study Session";
    } else {
      return "Break Time";
    }
  };

  if (!pomodoroState) {
    return null;
  }

  return (
    <BlurredWindow
      width="500px"
      padding={isMobile ? "20px" : "25px"}
      style={{
        marginTop: "20px",
        cursor: "pointer",
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => navigate("/pomodoro")}
        style={{
          width: "100%",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: theme === "dark" ? "white" : "black",
          transition: "opacity 0.2s",
          opacity: hovered ? 0.8 : 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IconContext.Provider
            value={{
              size: isMobile ? "24px" : "28px",
              color: theme === "dark" ? "#e2e8f0" : "#2d3748",
            }}
          >
            {pomodoroState.isRunning ? <FaPlay /> : <FaClock />}
          </IconContext.Provider>

          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: "bold",
                color: theme === "dark" ? "#e2e8f0" : "#2d3748",
              }}
            >
              {formatTime(pomodoroState.timeLeft)}
            </div>
            <div
              style={{
                fontSize: isMobile ? "13px" : "15px",
                opacity: 0.7,
                marginTop: "2px",
              }}
            >
              {getSessionTypeDisplay()}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: isMobile ? "18px" : "20px",
              fontWeight: "bold",
            }}
          >
            #{pomodoroState.sessionCount + 1}
          </div>
          <div
            style={{
              fontSize: isMobile ? "12px" : "14px",
              opacity: 0.6,
              marginTop: "2px",
            }}
          >
            {pomodoroState.isRunning ? "Running" : "Paused"}
          </div>
        </div>
      </div>
    </BlurredWindow>
  );
};
