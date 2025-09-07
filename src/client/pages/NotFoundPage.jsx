import { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "../contexts/ThemeContext";
import BlurredWindow from "../components/BlurredWindow";
import AnimatedBackButton from "../components/AnimatedBackButton";
import commonStyles from "../styles/commonStyles";
import notFoundImage from "../assets/404.png";
import PageTransition from "../components/PageTransition";

const NotFoundPage = () => {
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);

  const homeButtonStyle = {
    ...commonStyles.button,
    backgroundColor: theme === "dark" ? "#333" : "#fff",
    color: theme === "dark" ? "#e0e0e0" : "#000",
    borderColor: theme === "dark" ? "#444444" : "#dcdcdc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
    width: "180px",
    marginTop: "10px",
    transition:
      "background-color 0.3s, color 0.3s, border-color 0.3s, transform 0.2s ease, box-shadow 0.2s ease",
    ...(isHovered && {
      transform: "scale(1.05)",
      boxShadow:
        theme === "dark"
          ? "0 4px 15px rgba(255, 255, 255, 0.1)"
          : "0 4px 15px rgba(0, 0, 0, 0.1)",
      backgroundColor: theme === "dark" ? "#444" : "#f0f0f0",
    }),
  };

  return (
    <PageTransition>
      <div>
        <BlurredWindow width="450px">
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={commonStyles.pages.notFound.title(theme)}
              key={`404-${theme}`}
            >
              404
            </div>

            <img
              src={notFoundImage}
              alt="404 Error"
              style={commonStyles.pages.notFound.image}
            />

            <div style={commonStyles.pages.notFound.subtitle(theme)}>
              I'm afraid I can't do that.
            </div>

            <NavLink
              to="/"
              style={homeButtonStyle}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              Return Home
            </NavLink>
          </div>
        </BlurredWindow>
      </div>
    </PageTransition>
  );
};

export default NotFoundPage;
