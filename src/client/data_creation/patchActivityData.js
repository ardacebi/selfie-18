async function patchActivityData({
  title,
  description,
  startDate,
  endDate,
  isCompleted,
  activityID,
  userID,
}) {
  if (!activityID) {
    throw new Error("Activity ID is required");
  } else if (!userID) {
    throw new Error("User not found");
  } else if (!title || !startDate || !endDate) {
    throw new Error(
      "Please provide title, start date and end date for the activity",
    );
  } else {
    const res = await fetch(`/api/activities/update_activity/${activityID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        startDate,
        endDate,
        isCompleted,
        userID,
      }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default patchActivityData;
