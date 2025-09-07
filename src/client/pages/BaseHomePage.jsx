import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrentDateContext } from "../contexts/CurrentDateContext";
import { useContext, useEffect, useState, useRef } from "react";
import RecentStuffCard from "../components/RecentStuffCard";
import { PomodoroStatusCard } from "../components/PomodoroStatusCard";
import { FaCalendarAlt, FaClock, FaStickyNote } from "react-icons/fa";
import commonStyles from "../styles/commonStyles";
import selfieImg from "../assets/selfie.png";
import BlurredWindow from "../components/BlurredWindow";
import AnimatedButton from "../components/AnimatedButton";
import PageTransition from "../components/PageTransition";

const BaseHomePage = ({ isMobile }) => {
  const { currentUser, isLoading } = useContext(CurrentUserContext);
  const { theme } = useContext(ThemeContext);
  const { currentDate } = useContext(CurrentDateContext);
  const navigate = useNavigate();
  const location = useLocation();
  const themeStyles = commonStyles.getThemeStyles(theme);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 992,
  );
  const blurredWindowRef = useRef(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [pageKey, setPageKey] = useState(Date.now());
  const [gridW, setGridW] = useState(null); // width of card

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const u = () => {
      if (blurredWindowRef.current)
        setGridW(blurredWindowRef.current.offsetWidth);
    };
    u();
    window.addEventListener("resize", u);
    return () => window.removeEventListener("resize", u);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `button:hover, a:hover {background-color: ${themeStyles.hoverBg} !important;}`;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [themeStyles.hoverBg]);

  useEffect(() => {
    if (!isLoading && currentUser) {
      setShowContent(false);

      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, currentUser]);

  useEffect(() => {
    if (location.pathname === "/logout") {
      setShowContent(false);
      const timer = setTimeout(() => {
        navigate("/login");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  useEffect(() => {
    if (location.state && location.state.fromLogout) {
      setPageKey(Date.now());
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const isDark = theme === "dark";
  const getNavStyle = (isActive, isHovered) => ({
    ...commonStyles.button,
    backgroundColor: isActive
      ? themeStyles.activeBg
      : isDark
        ? "rgba(20, 20, 30, 0.7)"
        : themeStyles.inputBg,
    color: themeStyles.inputColor,
    borderColor: themeStyles.borderColor,
    transform: isHovered ? "scale(1.05)" : "scale(1)",
    boxShadow: isHovered
      ? isDark
        ? "0 4px 15px rgba(255, 255, 255, 0.1)"
        : "0 4px 15px rgba(0, 0, 0, 0.1)"
      : "none",
    backdropFilter: isDark ? "blur(10px)" : "none",
    WebkitBackdropFilter: isDark ? "blur(10px)" : "none",
    transition:
      "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s, color 0.3s, border-color 0.3s",
  });

  const formatTime = (d) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

  if (isLoading) {
    return (
      <div style={styles.container}>
        <BlurredWindow
          width="500px"
          style={{
            minHeight: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDark
              ? "rgba(20, 20, 30, 0.7)"
              : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            boxShadow: isDark
              ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
              : "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05) inset",
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ ...styles.loadingContainer }}>
            <div style={commonStyles.welcomeGradient(theme)} key={theme}>
              Loading...
            </div>
            <div
              style={{
                marginTop: "20px",
                width: "40px",
                height: "40px",
                border: `4px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                borderTop: `4px solid ${isDark ? "#ffffff" : "#333333"}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </BlurredWindow>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <PageTransition>
        <div style={styles.container}>
          <BlurredWindow width="500px">
            <div
              style={{
                ...styles.form,
                backgroundColor: "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={selfieImg}
                alt="Selfie"
                style={{ ...commonStyles.logo, marginBottom: "15px" }}
              />
              <div style={commonStyles.welcomeGradient(theme)} key={theme}>
                Welcome to Selfie!
              </div>
              <div
                style={{
                  ...styles.navContainer,
                  marginTop: "15px",
                  width: "90%",
                  maxWidth: "400px",
                }}
              >
                <NavLink
                  style={({ isActive }) => ({
                    ...getNavStyle(isActive, hoveredButton === "login"),
                    marginBottom: "15px",
                    width: "100%",
                    maxWidth: "none",
                  })}
                  to="/login"
                  onMouseEnter={() => setHoveredButton("login")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Log In
                </NavLink>
                <NavLink
                  style={({ isActive }) => ({
                    ...getNavStyle(isActive, hoveredButton === "signup"),
                    width: "100%",
                    maxWidth: "none",
                  })}
                  to="/sign_up"
                  onMouseEnter={() => setHoveredButton("signup")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Sign Up
                </NavLink>
              </div>
            </div>
          </BlurredWindow>
        </div>
      </PageTransition>
    );
  }

  const gapWidth = isMobile ? 10 : 20;
  const columns = 3;
  // match other cards
  const gridWidth = isMobile ? (gridW ? `${gridW}px` : "95%") : "500px";

  let calculatedButtonWidth;
  if (isMobile) {
    const containerW = gridW || windowWidth * 0.95;
    calculatedButtonWidth = (containerW - gapWidth * (columns - 1)) / columns;
  } else {
    calculatedButtonWidth = (500 - gapWidth * (columns - 1)) / columns; // grid 500px
  }

  const buttonWidth = Math.max(80, calculatedButtonWidth);
  const buttonHeight = buttonWidth * (isMobile ? 0.8 : 0.6);

  const getButtonContainerStyle = (buttonId) => {
    const isHovered = hoveredButton === buttonId;

    return {
      width: buttonWidth,
      height: buttonHeight,
      margin: "0 auto",
      position: "relative",
      backgroundColor: isDark
        ? "rgba(20, 20, 30, 0.7)"
        : "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: isDark
        ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
        : "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05) inset",
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(0, 0, 0, 0.05)",
      transform: isHovered
        ? isMobile
          ? "scale(1.03)"
          : "scale(1.08)"
        : "scale(1)",
      transition: "transform 0.2s ease",
      zIndex: isHovered ? 10 : 1,
      minWidth: isMobile ? "70px" : "120px",
      minHeight: isMobile ? "56px" : "72px",
    };
  };

  return (
    <PageTransition key={pageKey}>
      <div style={styles.container}>
        <div
          className={`content-container ${showContent ? "content-visible" : ""}`}
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? "scale(1)" : "scale(0.98)",
            transition:
              "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
            filter: showContent ? "blur(0)" : "blur(5px)",
            width: "100%",
          }}
        >
          <BlurredWindow
            ref={blurredWindowRef}
            width="500px"
            padding={isMobile ? "15px" : "20px"}
          >
            <div
              style={{
                backgroundColor: "transparent",
                display: "flex",
                flexDirection: "column",
                padding: "5px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  marginBottom: "0px",
                }}
              >
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    marginRight: "15px",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={selfieImg}
                    alt="Selfie"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: "translateZ(0)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      perspective: 1000,
                      WebkitPerspective: 1000,
                      WebkitTransform: "translateZ(0) scale(1.0, 1.0)",
                    }}
                  />
                </div>
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div
                    style={{
                      ...commonStyles.welcomeGradient(theme),
                      textAlign: "left",
                      fontSize: "26px",
                      marginBottom: "5px",
                      padding: "0",
                    }}
                    key={theme}
                  >
                    Welcome to Selfie!
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: theme === "dark" ? "#d0d0d0" : "#444444",
                      fontWeight: "normal",
                      textAlign: "left",
                      padding: "0",
                    }}
                  >
                    You are now logged in.
                  </div>
                </div>
              </div>
            </div>
          </BlurredWindow>

          <BlurredWindow width="500px" style={{ marginTop: "20px" }}>
            <div
              style={{
                backgroundColor: "transparent",
                display: "flex",
                flexDirection: "column",
                padding: "8px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: theme === "dark" ? "#d0d0d0" : "#444444",
                  textAlign: "center",
                  fontSize: "18px",
                  fontWeight: "400",
                  marginBottom: "20px",
                  marginTop: "-10px",
                }}
              >
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              <div
                style={{
                  ...commonStyles.welcomeGradient(theme),
                  textAlign: "center",
                  fontSize: "70px",
                  fontWeight: "200",
                  letterSpacing: "2px",
                  marginBottom: "-25px",
                  marginTop: "-25px",
                }}
                key={`clock-${theme}`}
              >
                {formatTime(currentDate)}
              </div>
            </div>
          </BlurredWindow>

          {/* three main buttons */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: `${gapWidth}px`,
              width: gridWidth,
              maxWidth: "100%",
              margin: "20px auto",
              padding: "0",
            }}
          >
            <div
              style={getButtonContainerStyle("calendar")}
              onMouseEnter={() => setHoveredButton("calendar")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <AnimatedButton
                icon={
                  <FaCalendarAlt
                    style={{
                      fontSize: isMobile ? "24px" : "28px",
                      marginBottom: isMobile ? "4px" : "8px",
                    }}
                  />
                }
                text={isMobile ? "" : "Calendar"}
                to="/calendar"
                backgroundColor="transparent"
                color={themeStyles.inputColor}
                borderColor="transparent"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "16px",
                  padding: isMobile ? "8px" : "0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  fontSize: isMobile ? "12px" : "16px",
                }}
              />
            </div>

            <div
              style={getButtonContainerStyle("pomodoro")}
              onMouseEnter={() => setHoveredButton("pomodoro")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <AnimatedButton
                icon={
                  <FaClock
                    style={{
                      fontSize: isMobile ? "24px" : "28px",
                      marginBottom: isMobile ? "4px" : "8px",
                    }}
                  />
                }
                text={isMobile ? "" : "Pomodoro"}
                to="/pomodoro"
                backgroundColor="transparent"
                color={themeStyles.inputColor}
                borderColor="transparent"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "16px",
                  padding: isMobile ? "8px" : "0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  fontSize: isMobile ? "12px" : "16px",
                }}
              />
            </div>

            <div
              style={getButtonContainerStyle("notes")}
              onMouseEnter={() => setHoveredButton("notes")}
              onMouseLeave={() => setHoveredButton(null)}
            >
              <AnimatedButton
                icon={
                  <FaStickyNote
                    style={{
                      fontSize: isMobile ? "24px" : "28px",
                      marginBottom: isMobile ? "4px" : "8px",
                    }}
                  />
                }
                text={isMobile ? "" : "Notes"}
                to="/notes"
                backgroundColor="transparent"
                color={themeStyles.inputColor}
                borderColor="transparent"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "16px",
                  padding: isMobile ? "8px" : "0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  fontSize: isMobile ? "12px" : "16px",
                }}
              />
            </div>
          </div>

          <PomodoroStatusCard isMobile={isMobile} />

          <RecentStuffCard isMobile={isMobile} />
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.98); filter: blur(5px); }
            to { opacity: 1; transform: scale(1); filter: blur(0); }
          }
        `}</style>
      </div>
    </PageTransition>
  );
};

const styles = {
  container: { padding: "10px", textAlign: "center", width: "100%" },
  form: {
    padding: "10px",
    display: "inline-block",
    marginTop: "20px",
    marginBottom: "20px",
  },
  navContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  button: { ...commonStyles.button, width: "auto", minWidth: "120px" },
  userIdBox: {
    display: "inline-block",
    border: "2px solid",
    borderRadius: "10px",
    padding: "5px 10px",
    marginTop: "5px",
  },
  userId: { fontFamily: "monospace", fontSize: "18px", margin: "0" },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    minHeight: "160px",
  },
};

export default BaseHomePage;
