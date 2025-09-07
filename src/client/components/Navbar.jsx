import { useState, useContext, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { FaSun, FaMoon, FaCog, FaSignOutAlt, FaInfo } from "react-icons/fa";
import commonStyles from "../styles/commonStyles";
import logo from "../assets/logo.png";
import logo_dark from "../assets/logo_dark.png";

const Navbar = () => {
  const { theme, toggleTheme, isSystemTheme, resetToSystemTheme } =
    useContext(ThemeContext);
  const { currentUser, setCurrentUser } = useContext(CurrentUserContext);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const buttonLeaveTimeoutRef = useRef(null);
  const navButtonsRef = useRef(new Map());
  const tooltipRef = useRef(null);
  const resetButtonRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const f = () => setIsMobile(window.innerWidth <= 768);
    f();
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const isDark = hydrated && theme === "dark";
  const themeStyles = commonStyles.getThemeStyles(theme);

  const colors = {
    moon: "#FFD700",
    sun: "#DAA520",
    bg: isDark ? "rgba(20, 20, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
    border: isDark ? "#444" : "#dcdcdc",
    tooltipBg: isDark ? "rgba(20, 20, 30, 0.7)" : "#fff",
    tooltipBorder: isDark ? "rgba(255, 255, 255, 0.1)" : "#ddd",
    resetBtnBg: isDark ? "rgba(30, 30, 40, 0.8)" : "#f0f0f0",
    resetBtnBorder: isDark ? "rgba(255, 255, 255, 0.15)" : "#ccc",
    iconColor: isDark ? "#e0e0e0" : "#555555",
  };

  const iconSize = 18;

  const handleLogout = () => {
    localStorage.removeItem("savedUser");
    setCurrentUser(null);
    navigate("/", { replace: true, state: { fromLogout: true } });
  };

  const handleTooltipToggle = (id, e) => {
    e.stopPropagation();
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  const handleMouseEnter = (id) => {
    clearTimeout(buttonLeaveTimeoutRef.current);
    setActiveTooltip(id);
    setHoveredButton(id);
  };

  const handleMouseLeave = () => {
    buttonLeaveTimeoutRef.current = setTimeout(() => {
      if (!isTooltipHovered) setActiveTooltip(null);
    }, 100);
    setHoveredButton(null);
  };

  const renderTooltip = (id, content) => {
    if (activeTooltip !== id) return null;
    if (isMobile) {
      const isInfo = id === "info";
      return (
        <div
          ref={tooltipRef}
          data-tooltip={id}
          style={{
            position: "absolute",
            right: 0,
            top: "45px",
            backgroundColor: colors.tooltipBg,
            color: themeStyles.inputColor,
            border: `1px solid ${colors.tooltipBorder}`,
            padding: "16px",
            borderRadius: "8px",
            fontSize: "14px",
            whiteSpace: "normal",
            width: isInfo ? "240px" : "auto",
            maxWidth: "80vw",
            zIndex: 9999,
            boxShadow: "0 3px 15px rgba(0,0,0,0.4)",
            touchAction: "manipulation",
            pointerEvents: "auto",
            backdropFilter: isDark ? "blur(10px)" : "none",
            WebkitBackdropFilter: isDark ? "blur(10px)" : "none",
            lineHeight: "1.4",
            textAlign: "left",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      );
    }
    return (
      <div
        ref={tooltipRef}
        data-tooltip={id}
        style={{
          position: "absolute",
          right: 0,
          top: "45px",
          backgroundColor: colors.tooltipBg,
          color: themeStyles.inputColor,
          border: `1px solid ${colors.tooltipBorder}`,
          padding: "12px",
          borderRadius: "4px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          zIndex: 9999,
          boxShadow: isDark
            ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
            : "0 3px 8px rgba(0,0,0,0.3)",
          touchAction: "manipulation",
          backdropFilter: isDark ? "blur(10px)" : "none",
          WebkitBackdropFilter: isDark ? "blur(10px)" : "none",
        }}
        onMouseEnter={() => setIsTooltipHovered(true)}
        onMouseLeave={() => {
          setIsTooltipHovered(false);
          setActiveTooltip(null);
        }}
      >
        {content}
      </div>
    );
  };

  const NavButton = ({ icon, onClick, tooltipId, tooltipContent }) => {
    const isHovered = hoveredButton === tooltipId;

    const handleButtonClick = (e) => {
      if (isMobile || tooltipId === "theme") {
        handleTooltipToggle(tooltipId, e);
      }

      if (onClick && tooltipId !== "info") {
        onClick();
      }
    };

    return (
      <div
        data-tooltip-button={tooltipId}
        ref={(el) => {
          if (el) navButtonsRef.current.set(tooltipId, el);
          else navButtonsRef.current.delete(tooltipId);
        }}
        style={{
          position: "relative",
          display: "inline-block",
          marginRight: tooltipId !== "logout" ? "10px" : "0",
        }}
        onMouseEnter={() => {
          setHoveredButton(tooltipId);
          if (window.innerWidth > 768) setActiveTooltip(tooltipId);
        }}
        onMouseLeave={() => {
          setHoveredButton(null);
          if (window.innerWidth > 768 && !isTooltipHovered)
            setTimeout(() => setActiveTooltip(null), 100);
        }}
      >
        <button
          onClick={handleButtonClick}
          style={{
            ...buttonStyle,
            backgroundColor: "transparent",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            background: isDark
              ? "rgba(20, 20, 30, 0.7)"
              : "rgba(255, 255, 255, 0.8)",
            boxShadow: isHovered
              ? isDark
                ? "0 6px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset"
                : "0 6px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1) inset"
              : isDark
                ? "0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
                : "0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05) inset",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            color: themeStyles.inputColor,
            border: isDark
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(0, 0, 0, 0.05)",
          }}
        >
          {icon}
        </button>
        {renderTooltip(tooltipId, tooltipContent)}
      </div>
    );
  };

  const themeIcon = isSystemTheme ? (
    <div style={{ display: "flex", alignItems: "center" }}>
      {isDark ? (
        <FaMoon
          size={iconSize}
          style={{ marginRight: "4px", color: colors.moon }}
        />
      ) : (
        <FaSun
          size={iconSize}
          style={{ marginRight: "4px", color: colors.sun }}
        />
      )}
      <FaCog size={iconSize * 0.6} />
    </div>
  ) : isDark ? (
    <FaMoon size={iconSize} color={colors.moon} />
  ) : (
    <FaSun size={iconSize} color={colors.sun} />
  );

  const themeTooltipContent = (
    <>
      {isSystemTheme ? "Using system theme" : "Using your saved preference"}
      {!isSystemTheme && (
        <button
          ref={resetButtonRef}
          data-reset-theme-button="true"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resetToSystemTheme();
            setActiveTooltip(null);
            setIsTooltipHovered(false);
          }}
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: isMobile ? "16px" : "12px",
            padding: isMobile ? "15px" : "10px 12px",
            backgroundColor: colors.resetBtnBg,
            border: `1px solid ${colors.resetBtnBorder}`,
            borderRadius: "5px",
            cursor: "pointer",
            color: themeStyles.inputColor,
            transform: hoveredButton === "reset" ? "scale(1.02)" : "scale(1)",
            transition: "transform 0.2s ease",
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
            position: "relative",
            zIndex: 10000,
            width: "100%",
            minWidth: isMobile ? "180px" : "140px",
            minHeight: isMobile ? "44px" : "36px",
            textAlign: "center",
            boxShadow:
              hoveredButton === "reset"
                ? isDark
                  ? "0 0 8px rgba(255, 255, 255, 0.2)"
                  : "0 0 8px rgba(0, 0, 0, 0.15)"
                : "none",
            backdropFilter: isDark ? "blur(10px)" : "none",
            WebkitBackdropFilter: isDark ? "blur(10px)" : "none",
            outline: "none",
            userSelect: "none",
          }}
          onMouseEnter={() => setHoveredButton("reset")}
          onMouseLeave={() => setHoveredButton("theme")}
        >
          Reset to system theme
        </button>
      )}
    </>
  );

  const buttonStyle = {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "all 0.3s ease",
  };

  useEffect(() => {
    const h = (e) => {
      if (!activeTooltip) return;
      if (resetButtonRef.current?.contains(e.target)) return;
      const insideTooltip = tooltipRef.current?.contains(e.target);
      const insideBtn = navButtonsRef.current
        .get(activeTooltip)
        ?.contains(e.target);
      if (!insideTooltip && !insideBtn) {
        setActiveTooltip(null);
        setIsTooltipHovered(false);
        setHoveredButton(null);
      }
    };
    document.addEventListener("mousedown", h, true);
    document.addEventListener("touchstart", h, true);
    return () => {
      document.removeEventListener("mousedown", h, true);
      document.removeEventListener("touchstart", h, true);
    };
  }, [activeTooltip]);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        zIndex: 1000,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "background-color 0.3s, color 0.3s",
        backgroundColor: colors.bg,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "100%",
          padding: "0 20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <NavLink
          to="/"
          style={{
            display: "inline-block",
            borderRadius: "8px",
            transition: "background-color 0.2s ease, transform 0.2s ease",
          }}
          className="link-hover-effect"
        >
          <img
            style={{ width: "120px", height: "auto" }}
            src={isDark ? logo_dark : logo}
            alt="Selfie Logo"
          />
        </NavLink>

        <div style={{ display: "flex", alignItems: "center" }}>
          <NavButton
            icon={<FaInfo size={iconSize} color={colors.iconColor} />}
            tooltipId="info"
            tooltipContent="Progetto di corso Tecnologie Web fatta da Alessandro D'Ambrosio e Arda Çebi."
            onClick={(e) => handleTooltipToggle("info", e)}
          />
          <NavButton
            icon={themeIcon}
            onClick={toggleTheme}
            tooltipId="theme"
            tooltipContent={themeTooltipContent}
          />
          {currentUser && (
            <NavButton
              icon={<FaSignOutAlt size={iconSize} color={colors.iconColor} />}
              onClick={handleLogout}
              tooltipId="logout"
              tooltipContent="Log out"
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
