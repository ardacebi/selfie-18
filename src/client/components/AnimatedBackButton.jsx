import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import commonStyles from "../styles/commonStyles";
import { FaArrowLeft } from "react-icons/fa";

const AnimatedBackButton = ({
  to = "/",
  text = "Go back",
  icon = <FaArrowLeft style={{ marginRight: "8px" }} />,
}) => {
  const { theme } = useContext(ThemeContext);
  const themeStyles = commonStyles.getThemeStyles(theme);
  const [isHovered, setIsHovered] = useState(false);

  const isDark = theme === "dark";

  return (
    <NavLink
      to={to}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...commonStyles.backButton,
        backgroundColor: "transparent",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        background: isDark
          ? "rgba(20, 20, 30, 0.7)"
          : "rgba(255, 255, 255, 0.8)",
        boxShadow: isHovered
          ? isDark
            ? "0 6px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2) inset"
            : "0 6px 16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1) inset"
          : isDark
            ? "0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
            : "0 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05) inset",
        color: themeStyles.inputColor,
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.05)",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s, color 0.3s, border-color 0.3s",
      }}
    >
      {icon} {text}
    </NavLink>
  );
};

export default AnimatedBackButton;
