async function fetchActivityData({ activityID, userID }) {
  if (activityID === null) {
    throw new Error("Provide a activityID");
  } else if (userID === null) {
    throw new Error("Provide a userID");
  } else {
    const res = await fetch(`/api/activities/get_activity_by_id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ activityID, userID }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default fetchActivityData;
