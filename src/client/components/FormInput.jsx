import { useState, useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import commonStyles from "../styles/commonStyles";

const FormInput = ({
  type = "text",
  name,
  id,
  placeholder,
  required = false,
  style = {},
  marginBottom = "15px",
  maxLength,
  value,
  onChange = () => {},
  checked = false,
}) => {
  const { theme } = useContext(ThemeContext);
  const themeStyles = commonStyles.getThemeStyles(theme);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isDark = theme === "dark";

  return (
    <label htmlFor={id || name} style={{ width: "100%" }}>
      <input
        style={{
          ...commonStyles.field,
          backgroundColor: isDark
            ? "rgba(20, 20, 30, 0.7)"
            : themeStyles.inputBg,
          color: themeStyles.inputColor,
          marginBottom: marginBottom,
          width: "100%",
          boxSizing: "border-box",
          borderColor: isFocused
            ? isDark
              ? "rgba(255, 255, 255, 0.2)"
              : "#aaaaaa"
            : isDark
              ? "rgba(255, 255, 255, 0.1)"
              : themeStyles.borderColor,
          boxShadow: isFocused
            ? isDark
              ? "0 0 0 2px rgba(255, 255, 255, 0.15)"
              : "0 0 0 2px #e0e0e0"
            : isHovered
              ? isDark
                ? "0 4px 15px rgba(255, 255, 255, 0.1)"
                : "0 4px 15px rgba(0, 0, 0, 0.1)"
              : "none",
          backdropFilter: isDark ? "blur(10px)" : "none",
          WebkitBackdropFilter: isDark ? "blur(10px)" : "none",
          transform: isHovered && !isFocused ? "scale(1.02)" : "scale(1)",
          transition:
            "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.3s, background-color 0.3s",
          ...style,
        }}
        name={name}
        id={id || name}
        type={type}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength || Infinity}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onChange={onChange}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        checked={checked}
      />
      <br />
    </label>
  );
};

export default FormInput;
