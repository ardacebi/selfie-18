import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import fetchActivityData from "../data_fetching/fetchActivityData";
import patchActivityData from "../data_creation/patchActivityData";
import patchDeleteActivity from "../data_deletion/patchDeleteActivity";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { FaExclamationCircle } from "react-icons/fa";
import { RiDeleteBin5Fill } from "react-icons/ri";
import { IconContext } from "react-icons";
import commonStyles from "../styles/commonStyles";
import AnimatedBackButton from "../components/AnimatedBackButton";
import BlurredWindow from "../components/BlurredWindow";
import PageTransition from "../components/PageTransition";
import FormInput from "../components/FormInput";
import FormButton from "../components/FormButton";

const ActivitiesEditor = () => {
  const { theme } = useContext(ThemeContext);
  const { activityID } = useParams();
  const { currentUser } = useContext(CurrentUserContext);

  const [deleteButtonHovered, setDeleteButtonHovered] = useState(false);

  const [error, setError] = useState("");
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedStartDate, setEditedStartDate] = useState("");
  const [formattedStartDate, setFormattedStartDate] = useState(null);
  const [editedEndDate, setEditedEndDate] = useState("");
  const [formattedEndDate, setFormattedEndDate] = useState(null);
  const [editedIsCompleted, setEditedIsCompleted] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const { data: activityData, refetch: refetchActivity } = useQuery(
    ["activityData", activityID],
    () => fetchActivityData({ activityID: activityID, userID: currentUser }),
    {
      enabled: !!currentUser && !!activityID,
      onError: (err) => {
        setError(err.message);
        setShowErrorBanner(true);
      },
    },
  );

  useEffect(() => {
    if (activityData) {
      setEditedTitle(activityData.data.title || "");
      setEditedDescription(activityData.data.description || "");
      setEditedStartDate(activityData.data.startDate || "");
      setEditedEndDate(activityData.data.endDate || "");
      setEditedIsCompleted(activityData.data.isCompleted || false);
    }
  }, [activityData]);

  useEffect(() => {
    if (editedEndDate) {
      const dateObj = new Date(editedEndDate);
      const timeZoneOffset = dateObj.getTimezoneOffset() * 60000;
      const formatted = new Date(dateObj - timeZoneOffset)
        .toISOString()
        .slice(0, 10);
      setFormattedEndDate(formatted);
    }

    if (editedStartDate) {
      const dateObj = new Date(editedStartDate);
      const timeZoneOffset = dateObj.getTimezoneOffset() * 60000;
      const formatted = new Date(dateObj - timeZoneOffset)
        .toISOString()
        .slice(0, 10);
      setFormattedStartDate(formatted);
    }
  }, [editedEndDate, editedStartDate, activityData]);

  const formatToDate = (fDate) => {
    if (!fDate) return null;
    else return new Date(fDate + "T00:00:00");
  };

  const patchActivity = useMutation(patchActivityData, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: () => {
      queryClient.invalidateQueries(["userActivities", currentUser]);
      refetchActivity();
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  const handleActivityPatchSubmit = async (e) => {
    try {
      setShowErrorBanner(false);
      e.preventDefault();
      const formData = new FormData(e.target);
      const title = formData.get("title");
      const description = formData.get("description");
      const startDate = formatToDate(formattedStartDate);
      const endDate = formatToDate(formattedEndDate);
      const isCompleted = editedIsCompleted;

      patchActivity.mutate({
        activityID: activityID,
        userID: currentUser,
        title: title,
        description: description,
        startDate: startDate,
        endDate: endDate,
        isCompleted: isCompleted,
      });

      navigate("/calendar");
    } catch (error) {
      setError(error.message);
      setShowErrorBanner(true);
    }
  };

  const patchDeleteActivityMutation = useMutation(patchDeleteActivity, {
    onMutate: () => setShowErrorBanner(false),
    onSuccess: () => {
      setError("");
      setShowErrorBanner(false);
      navigate("/calendar");
    },
    onError: (err) => {
      setError(err.message);
      setShowErrorBanner(true);
    },
  });

  return (
    <PageTransition>
      <div>
        <BlurredWindow
          width={isMobile ? "95%" : "850px"}
          padding={isMobile ? "10px" : "20px"}
        >
          {showErrorBanner && (
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
          )}

          {activityData ? (
            <div style={{ position: "relative" }}>
              <div
                style={{
                  margin: "0 auto",
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  padding: "5px",
                  boxSizing: "border-box",
                }}
              >
                <AnimatedBackButton
                  to="/calendar"
                  text="Back to Calendar"
                  style={{ alignSelf: "flex-start" }}
                />

                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setDeleteButtonHovered(true)}
                    onMouseLeave={() => setDeleteButtonHovered(false)}
                    style={{
                      ...commonStyles.notes.noteDeleteButton,
                      ...(deleteButtonHovered
                        ? commonStyles.notes.noteDeleteButtonHover(isMobile)
                        : {}),
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      patchDeleteActivityMutation.mutate({
                        activityID: activityID,
                        userID: currentUser,
                      });
                    }}
                  >
                    <IconContext.Provider
                      value={{
                        color: theme === "dark" ? "white" : "black",
                        size: isMobile ? "30px" : "20px",
                      }}
                    >
                      <RiDeleteBin5Fill />
                    </IconContext.Provider>
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleActivityPatchSubmit}
                style={{ maxWidth: "250px" }}
              >
                <FormInput
                  name="title"
                  placeholder="Title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  required={true}
                  maxLength="20"
                />
                <FormInput
                  name="description"
                  placeholder="Description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  maxLength="150"
                  style={{ marginTop: "10px" }}
                />
                <p
                  style={{
                    color:
                      theme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
                  }}
                >
                  Activity Starts At:
                </p>
                <FormInput
                  name="startDate"
                  type="date"
                  required={true}
                  value={formattedStartDate || ""}
                  onChange={(e) => setFormattedStartDate(e.target.value)}
                />
                <p
                  style={{
                    color:
                      theme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)",
                  }}
                >
                  Activity Ends At:
                </p>
                <FormInput
                  name="endDate"
                  type="date"
                  required={true}
                  value={formattedEndDate || ""}
                  onChange={(e) => setFormattedEndDate(e.target.value)}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <p
                    style={{
                      color:
                        theme === "dark"
                          ? "rgb(255, 255, 255)"
                          : "rgb(0, 0, 0)",
                      marginRight: "auto",
                    }}
                  >
                    Complete Activity:
                  </p>
                  <FormInput
                    type="checkbox"
                    name="isCompleted"
                    checked={editedIsCompleted}
                    onChange={(e) => {
                      if (!e.target.checked) setEditedIsCompleted(false);
                      else setEditedIsCompleted(true);
                    }}
                    style={{ transform: "scale(1.25)" }}
                  />
                </div>

                <FormButton>Save</FormButton>
              </form>
            </div>
          ) : (
            <p>Loading activity...</p>
          )}
        </BlurredWindow>
      </div>
    </PageTransition>
  );
};

export default ActivitiesEditor;
