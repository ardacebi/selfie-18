import { NavLink, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState, useContext, useEffect } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import postAccountData from "../data_creation/postAccountData.js";
import { ThemeContext } from "../contexts/ThemeContext.jsx";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";
import BlurredWindow from "../components/BlurredWindow";
import AnimatedBackButton from "../components/AnimatedBackButton";
import commonStyles from "../styles/commonStyles.js";
import selfieImg from "../assets/selfie_signup.png";
import PageTransition from "../components/PageTransition";

const SignUpForm = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const themeStyles = commonStyles.getThemeStyles(theme);
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

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = commonStyles.linkHoverStyles(theme);
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [isDark, theme]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = commonStyles.getDynamicCSS(theme);
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [theme]);

  const signup = useMutation(postAccountData, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: () =>
      navigate("/login", { replace: true, state: { fromSignup: true } }),
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    signup.mutate({
      email: formData.get("email") ?? "",
      username: formData.get("username") ?? "",
      password: formData.get("password") ?? "",
    });
  };

  return (
    <PageTransition>
      <div
        style={{ width: "100%", boxSizing: "border-box", overflowX: "hidden" }}
      >
        {/* Updated header container with centered width matching BlurredWindow */}
        <div
          style={{
            maxWidth: "450px",
            margin: "0 auto",
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            padding: "10px",
            marginTop: "10px",
            marginBottom: "20px",
            boxSizing: "border-box",
          }}
        >
          <AnimatedBackButton to="/" />
        </div>

        <BlurredWindow width="450px">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div style={commonStyles.pages.common.imageContainer}>
              <img src={selfieImg} alt="Selfie" style={commonStyles.logo} />
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                ...commonStyles.form.container,
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={commonStyles.form.titleContainer}>
                <div style={commonStyles.gradientTitle(theme)} key={theme}>
                  Sign Up
                </div>
              </div>

              <div
                style={{
                  ...commonStyles.form.inputContainer,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <FormInput name="email" placeholder="Email" required={true} />
                <FormInput
                  name="username"
                  placeholder="Username"
                  required={true}
                />
                <FormInput
                  name="password"
                  type="password"
                  placeholder="Password"
                  required={true}
                />

                <FormButton>Create Account</FormButton>

                <div style={commonStyles.pages.common.centerAlignedContent}>
                  <NavLink
                    style={commonStyles.pages.common.navLink(theme)}
                    className="link-hover-effect"
                    to="/login"
                  >
                    Already have an account?
                  </NavLink>
                </div>
              </div>

              <div
                style={commonStyles.getBannerStyle(
                  "errorBannerStyle",
                  showErrorBanner,
                  theme,
                )}
              >
                <FaExclamationCircle style={commonStyles.bannerIconStyle} />
                <span>{error}</span>
              </div>
            </form>
          </div>
        </BlurredWindow>
      </div>
    </PageTransition>
  );
};

export default SignUpForm;
