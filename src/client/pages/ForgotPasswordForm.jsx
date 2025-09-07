import { useState, useContext, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaExclamationCircle, FaInbox } from "react-icons/fa";
import BlurredWindow from "../components/BlurredWindow";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";
import AnimatedBackButton from "../components/AnimatedBackButton";
import { ThemeContext } from "../contexts/ThemeContext";
import commonStyles from "../styles/commonStyles";
import selfieImg from "../assets/selfie_forgot.png";
import postNewPassword from "../data_creation/postNewPassword";
import PageTransition from "../components/PageTransition";

const ForgotPasswordForm = () => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const themeStyles = commonStyles.getThemeStyles(theme);
  const isDark = theme === "dark";

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

  const resetPassword = useMutation(postNewPassword, {
    onMutate: () => {
      document.querySelector("#error_text").style.visibility = "hidden";
    },
    onSuccess: () =>
      navigate("/login", { replace: true, state: { fromPasswordReset: true } }),
    onError: (err) => {
      setError(err.message);
      const errorText = document.querySelector("#error_text");
      errorText.style.color = "red";
      errorText.style.visibility = "visible";
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    resetPassword.mutate({
      email: formData.get("email") ?? "",
      password: formData.get("password") ?? "",
    });
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
          <AnimatedBackButton to="/login" />
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
              <img
                src={selfieImg}
                alt="Selfie"
                style={{ ...commonStyles.logo, marginBottom: "5px" }}
              />
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
                  Forgot Password
                </div>
              </div>

              <div style={commonStyles.form.inputContainer}>
                <FormInput name="email" placeholder="Email" required={true} />
                <FormInput
                  name="password"
                  type="password"
                  placeholder="New Password"
                  required={true}
                />
                <FormButton>Change Password</FormButton>
              </div>
            </form>

            <div style={commonStyles.infoBox(theme)}>
              <div style={commonStyles.infoIcon(theme)}>i</div>
              <p style={commonStyles.infoText(theme)}>
                In production environments, password changes require email
                verification for security. This is not the case in this
                educational project. Without this verification, any user could
                change another user's password, which is not expected practice.
              </p>
            </div>

            <p
              id="error_text"
              style={{
                ...commonStyles.errorText,
                fontFamily: "sans-serif",
                textAlign: "center",
                width: "100%",
              }}
            >
              {error}
            </p>
          </div>
        </BlurredWindow>
      </div>
    </PageTransition>
  );
};

export default ForgotPasswordForm;
