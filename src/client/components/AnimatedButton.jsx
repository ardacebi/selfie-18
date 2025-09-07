import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";

const AnimatedButton = ({
  icon,
  text,
  to,
  backgroundColor,
  color,
  borderColor,
  style = {},
}) => {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const highlightRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const effectiveBorderColor =
    borderColor === "transparent" && !isDark ? "#b5b5b5" : borderColor;

  const handleMouseMove = (e) => {
    if (!buttonRef.current || !highlightRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const eX = e.clientX - rect.left;
    const eY = e.clientY - rect.top;
    const w = rect.width / 2;
    const h = rect.height / 2;
    const tiltLimit = 15;
    const posX = (h - eY) * (tiltLimit / h);
    const posY = (w - eX) * (tiltLimit / w) * -1;

    // tilt effect for the button
    buttonRef.current.style.transform = `perspective(500px) rotateX(${posX}deg) rotateY(${posY}deg)`;
    buttonRef.current.style.boxShadow = `${posY * -1}px ${posX + 14}px 34px 0 rgba(0, 0, 0, 0.1)`;

    const highlightSize = 200;
    const oppositeX = rect.width - eX - highlightSize / 2;
    const oppositeY = rect.height - eY - highlightSize / 2;

    highlightRef.current.style.opacity = "1";
    highlightRef.current.style.left = `${oppositeX}px`;
    highlightRef.current.style.top = `${oppositeY}px`;
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current || !highlightRef.current) return;

    setIsEnding(true);
    buttonRef.current.style.transform = "";
    buttonRef.current.style.boxShadow = "";

    highlightRef.current.style.opacity = "0";

    setTimeout(() => {
      setIsEnding(false);
    }, 500);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover)");
    const hasHoverCapability = mediaQuery.matches;

    // Only apply hover effects if device supports hover
    if (buttonRef.current) {
      if (hasHoverCapability) {
        buttonRef.current.addEventListener("mousemove", handleMouseMove);
        buttonRef.current.addEventListener("mouseleave", handleMouseLeave);
      }
    }

    return () => {
      if (buttonRef.current && hasHoverCapability) {
        buttonRef.current.removeEventListener("mousemove", handleMouseMove);
        buttonRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={() => navigate(to)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={isEnding ? "hover--ending" : ""}
      style={{
        position: "relative",
        padding: "15px",
        borderRadius: "10px",
        border: `2px solid ${effectiveBorderColor}`,
        backgroundColor,
        color,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: text ? "120px" : "60px",
        width: "auto",
        fontSize: "16px",
        overflow: "hidden",
        transformOrigin: "center center",
        boxShadow:
          !isDark && !isHovered ? "0 1px 3px rgba(0, 0, 0, 0.05)" : undefined,
        transition: isEnding
          ? "box-shadow 0.5s ease"
          : "background-color 0.3s, color 0.3s, border-color 0.3s",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      <span
        ref={highlightRef}
        style={{
          display: "block",
          position: "absolute",
          width: "200px",
          height: "200px",
          opacity: "0",
          zIndex: 3,
          pointerEvents: "none",
          transition: "opacity 0.25s ease",
          background:
            "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.15) 40%, rgba(255, 255, 255, 0.05) 60%, rgba(255, 255, 255, 0) 70%)",
          filter: "blur(5px)",
          borderRadius: "50%",
        }}
      />
      {icon}
      {text && <span style={{ marginTop: text ? "4px" : "0" }}>{text}</span>}
    </button>
  );
};

export default AnimatedButton;
