import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState, useContext, useEffect } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import fetchLoginData from "../data_fetching/fetchLoginData.js";
import { CurrentUserContext } from "../contexts/CurrentUserContext.jsx";
import { ThemeContext } from "../contexts/ThemeContext.jsx";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";
import BlurredWindow from "../components/BlurredWindow";
import AnimatedBackButton from "../components/AnimatedBackButton";
import commonStyles from "../styles/commonStyles.js";
import selfieImg from "../assets/selfie_locked.png";
import PageTransition from "../components/PageTransition";

const LoginForm = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [showPasswordResetSuccess, setShowPasswordResetSuccess] =
    useState(false);
  const { setCurrentUser } = useContext(CurrentUserContext);
  const themeStyles = commonStyles.getThemeStyles(theme);
  const [isCheckboxHovered, setIsCheckboxHovered] = useState(false);
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

  useEffect(() => {
    const { state } = location;
    if (!state) return;

    const showSuccess = (flag, timeout = 10000) => {
      flag(true);
      const timerId = setTimeout(
        () => window.history.replaceState({}, document.title),
        timeout,
      );
      return () => clearTimeout(timerId);
    };

    if (state.fromSignup) return showSuccess(setShowSignupSuccess);
    if (state.fromPasswordReset)
      return showSuccess(setShowPasswordResetSuccess);
  }, [location]);

  const login = useMutation(fetchLoginData, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: (res) => {
      setCurrentUser(res.data._id);
      if (rememberMe) localStorage.setItem("savedUser", res.data._id);
      navigate("/", { replace: true });
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    login.mutate({
      username: formData.get("username") ?? "",
      password: formData.get("password") ?? "",
    });
  };

  const handleCheckboxChange = (e) => {
    setRememberMe(e.target.checked);
  };

  return (
    <PageTransition>
      <div
        style={{ width: "100%", boxSizing: "border-box", overflowX: "hidden" }}
      >
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
                  Log In
                </div>
              </div>

              <div
                style={{
                  ...commonStyles.form.inputContainer,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
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

                <div
                  style={{
                    ...commonStyles.form.checkbox.container,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <input
                    id="remember-me-checkbox"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleCheckboxChange}
                    style={{
                      opacity: 0,
                      position: "absolute",
                      width: 0,
                      height: 0,
                    }}
                  />
                  <label
                    htmlFor="remember-me-checkbox"
                    style={{
                      ...commonStyles.form.checkbox.label,
                      color: themeStyles.linkColor,
                    }}
                    onMouseEnter={() => setIsCheckboxHovered(true)}
                    onMouseLeave={() => setIsCheckboxHovered(false)}
                  >
                    <div
                      style={commonStyles.form.checkbox.outer(
                        theme,
                        rememberMe,
                        isCheckboxHovered,
                      )}
                    >
                      <div
                        style={commonStyles.form.checkbox.highlight(
                          theme,
                          isCheckboxHovered,
                        )}
                      ></div>
                      <div
                        style={{
                          ...commonStyles.form.checkbox.inner(rememberMe),
                          backgroundColor: isDark ? "#ffffff" : "#0066cc",
                        }}
                      ></div>
                    </div>
                    Remember me
                  </label>
                </div>

                <FormButton>Log In</FormButton>

                <div style={commonStyles.pages.common.centerAlignedContent}>
                  <NavLink
                    style={commonStyles.pages.common.navLink(theme)}
                    className="link-hover-effect"
                    to="/forgot_password"
                  >
                    Forgot your password?
                  </NavLink>
                </div>

                <div
                  style={{
                    ...commonStyles.pages.common.centerAlignedContent,
                    marginTop: "5px",
                  }}
                >
                  <NavLink
                    style={commonStyles.pages.common.navLink(theme)}
                    className="link-hover-effect"
                    to="/sign_up"
                  >
                    Don't have an account? Sign up.
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

              <div
                style={commonStyles.getBannerStyle(
                  "successBannerStyle",
                  showSignupSuccess,
                  theme,
                )}
              >
                <FaCheckCircle style={commonStyles.bannerIconStyle} />
                <span>
                  Account created successfully! You can now log in with your
                  credentials.
                </span>
              </div>

              <div
                style={commonStyles.getBannerStyle(
                  "successBannerStyle",
                  showPasswordResetSuccess,
                  theme,
                )}
              >
                <FaCheckCircle style={commonStyles.bannerIconStyle} />
                <span>
                  Success! The password has been changed! You can now log in
                  with your new password.
                </span>
              </div>
            </form>
          </div>
        </BlurredWindow>
      </div>
    </PageTransition>
  );
};

export default LoginForm;
