import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { FaCalendarAlt, FaClock, FaHome, FaStickyNote } from "react-icons/fa";
import commonStyles from "../styles/commonStyles";

const SubNavbar = () => {
  const { theme } = useContext(ThemeContext);
  const { currentUser } = useContext(CurrentUserContext);
  const isDark = theme === "dark";
  const themeStyles = commonStyles.getThemeStyles(theme);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [showNav, setShowNav] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const f = () => setIsMobile(window.innerWidth <= 768);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);

  useEffect(() => {
    const valid = ["/calendar", "/pomodoro", "/notes"];
    setShowNav(!!currentUser && valid.includes(location.pathname));
  }, [location.pathname, currentUser]);

  if (!showNav) {
    return null;
  }

  const navItems = [
    { path: "/", icon: <FaHome />, text: "Home" },
    { path: "/calendar", icon: <FaCalendarAlt />, text: "Calendar" },
    { path: "/pomodoro", icon: <FaClock />, text: "Pomodoro" },
    { path: "/notes", icon: <FaStickyNote />, text: "Notes" },
  ];

  const standardButtonHeight = isMobile ? "30px" : "35px";
  const standardButtonWidth = isMobile ? "90px" : "110px";

  const getNavStyle = (isActive, isHovered) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: standardButtonWidth,
    height: standardButtonHeight,
    padding: "0 16px",
    margin: "0 8px",
    borderRadius: "10px",
    textDecoration: "none",
    color: themeStyles.inputColor,
    backgroundColor: isActive
      ? isDark
        ? "rgba(40, 40, 50, 0.7)"
        : themeStyles.activeBg
      : isDark
        ? "rgba(20, 20, 30, 0.7)"
        : "#fff",
    border: `2px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "#cccccc"}`,
    transition:
      "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s, color 0.3s, border-color 0.3s",
    whiteSpace: "nowrap",
    fontWeight: isActive ? "500" : "normal",
    transform: isHovered && !isMobile ? "scale(1.05)" : "scale(1)",
    zIndex: isHovered ? 10 : 1,
    boxShadow:
      isHovered && !isMobile
        ? isDark
          ? "0 4px 15px rgba(255, 255, 255, 0.1)"
          : "0 4px 15px rgba(0, 0, 0, 0.1)"
        : "none",
    backdropFilter: isDark ? "blur(10px)" : "none",
    WebkitBackdropFilter: isDark ? "blur(10px)" : "none",
    fontSize: isMobile ? "12px" : "14px",
  });

  const separatorStyle = {
    width: "1px",
    height: "28px",
    backgroundColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
    margin: "0 8px",
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "60px",
        left: 0,
        right: 0,
        zIndex: 900,
        backgroundColor: isDark ? "transparent" : "rgba(255, 255, 255, 0.9)",
        backdropFilter: isDark ? "none" : "blur(8px)",
        WebkitBackdropFilter: isDark ? "none" : "blur(8px)",
        borderBottom: isDark ? "none" : "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: isDark ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
        padding: "0",
        height: isMobile ? "50px" : "60px",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "1200px",
          margin: "0 auto",
          height: "100%",
        }}
      >
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflowX: "auto",
            scrollBehavior: "smooth",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            padding: "0 20px",
            height: "100%",
            WebkitOverflowScrolling: "touch", // Enable momentum scrolling on iOS
          }}
          className="no-scrollbar"
        >
          {navItems.map((item, index) => (
            <React.Fragment key={item.path}>
              <NavLink
                to={item.path}
                style={({ isActive }) =>
                  getNavStyle(isActive, hoveredLink === item.path)
                }
                onMouseEnter={() => setHoveredLink(item.path)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <span
                  style={{
                    marginRight: "8px",
                    fontSize: isMobile ? "16px" : "20px",
                    display: "flex",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </NavLink>

              {index === 0 && <div style={separatorStyle}></div>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubNavbar;
