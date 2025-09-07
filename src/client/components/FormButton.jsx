import { useState, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import commonStyles from "../styles/commonStyles";

const FormButton = ({ type = "submit", onClick, children, style = {} }) => {
  const { theme } = useContext(ThemeContext);
  const themeStyles = commonStyles.getThemeStyles(theme);
  const [isHovered, setIsHovered] = useState(false);

  const isDark = theme === "dark";

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...commonStyles.button,
        backgroundColor: isDark ? "rgba(20, 20, 30, 0.7)" : themeStyles.inputBg,
        color: themeStyles.inputColor,
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#b5b5b5",
        width: "100%",
        maxWidth: "none",
        boxSizing: "border-box",
        padding: "10px 25px",
        margin: "0",
        backdropFilter: isDark ? "blur(10px)" : "none",
        WebkitBackdropFilter: isDark ? "blur(10px)" : "none",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        boxShadow: isHovered
          ? isDark
            ? "0 4px 15px rgba(255, 255, 255, 0.1)"
            : "0 4px 15px rgba(0, 0, 0, 0.1)"
          : isDark
            ? "none"
            : "0 1px 3px rgba(0, 0, 0, 0.05)",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s, color 0.3s, border-color 0.3s",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export default FormButton;
