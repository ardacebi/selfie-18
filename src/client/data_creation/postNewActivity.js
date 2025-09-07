async function postNewActivity({
  title,
  description,
  startDate,
  endDate,
  userID,
}) {
  if (!userID) {
    throw new Error("User not found");
  } else if (!title || !startDate || !endDate) {
    throw new Error(
      "Please provide title, start date and end date for the activity",
    );
  } else {
    const res = await fetch(`/api/activities/create_activity/${userID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        startDate,
        endDate,
      }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default postNewActivity;
