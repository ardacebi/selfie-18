import { useContext, useState, useEffect } from "react";
import { IconContext } from "react-icons";
import { CurrentDateContext } from "../contexts/CurrentDateContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { GiSandsOfTime } from "react-icons/gi";
import commonStyles from "../styles/commonStyles.js";

const TimeMachine = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 992,
  );

  const {
    currentDate,
    setCurrentDate,
    manualControl,
    setManualControl,
    isTimeStopped,
    setIsTimeStopped,
  } = useContext(CurrentDateContext);

  const { theme } = useContext(ThemeContext);

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Adds the shake animation styles to the document's head
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = commonStyles.shakeAnimation;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  const isMobile = windowWidth < 576;

  const handleManualControlToggle = async () => {
    await setManualControl((prev) => !prev);
    if (manualControl) setIsTimeStopped(false);
    else setIsTimeStopped(true);
  };
  const handleTimeStopToggle = () => {
    setIsTimeStopped((prev) => !prev);
  };
  const handleMoreHour = () => {
    const newDate = new Date(currentDate);
    newDate.setHours(newDate.getHours() + 1);
    setCurrentDate(newDate);
  };
  const handleDateSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements[0];
    const newDate = new Date(input.value);
    if (!manualControl) handleManualControlToggle();
    setCurrentDate(newDate);
  };

  // Handle the Sands of Time button click
  const handleSOTOnClick = () => {
    setShaking(true);
    toggleVisibility();
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      {/* Time machine visibility button */}
      <nav>
        <div
          onClick={handleSOTOnClick}
          style={commonStyles.timeMachine.timeMachineButton(theme)}
        >
          <IconContext.Provider
            value={{
              color: theme === "dark" ? "white" : "black",
              size: isMobile ? "30px" : "24px",
            }}
          >
            <div
              className={shaking ? "shake" : ""}
              onAnimationEnd={() => setShaking(false)}
            >
              <GiSandsOfTime />
            </div>
          </IconContext.Provider>
        </div>

        {/* Time machine container */}
        <nav
          style={commonStyles.timeMachine.timeMachineContainer(
            theme,
            isMobile,
            isVisible,
          )}
        >
          <h2>Time Machine</h2>
          <p>Current Date: {currentDate.toISOString()}</p>
          <button onClick={handleManualControlToggle}>
            {manualControl ? "Stop Manual Control" : "Start Manual Control"}
          </button>
          <button onClick={handleTimeStopToggle}>
            {isTimeStopped ? "Resume Time" : "Stop Time"}
          </button>
          <button onClick={handleMoreHour}>More hour</button>
          <form onSubmit={handleDateSubmit}>
            <input
              type="datetime-local"
              step="1"
              defaultValue={currentDate.toISOString().slice(0, 19)}
            />
            <button type="submit">Set Date</button>
          </form>
        </nav>
      </nav>
    </div>
  );
};

export default TimeMachine;
