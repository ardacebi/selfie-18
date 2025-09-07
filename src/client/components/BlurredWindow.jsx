import { useContext, forwardRef, useEffect, useState } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const BlurredWindow = forwardRef(
  ({ children, width = "400px", padding = "30px", style = {} }, ref) => {
    const { theme } = useContext(ThemeContext);
    const isDark = theme === "dark";
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      checkMobile();
      window.addEventListener("resize", checkMobile);

      return () => {
        window.removeEventListener("resize", checkMobile);
      };
    }, []);

    const styles = {
      container: {
        backgroundColor: isDark
          ? "rgba(20, 20, 30, 0.7)"
          : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: "16px",
        boxShadow: isDark
          ? "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
          : "0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05) inset",
        padding: isMobile ? "20px" : padding,
        width: isMobile ? "auto" : width,
        maxWidth: isMobile ? "95%" : "100%",
        margin: "20px auto",
        transition: "background-color 0.3s, box-shadow 0.3s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        zIndex: 5,
        border: isDark
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.05)",
        boxSizing: "border-box",
        overflowX: "hidden",
        ...style,
      },
    };

    return (
      <div ref={ref} style={styles.container}>
        {children}
      </div>
    );
  },
);

export default BlurredWindow;
