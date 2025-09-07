async function fetchAllActivitiesData({ userID }) {
  if (userID === null) {
    throw new Error("User not found");
  } else {
    const res = await fetch(
      `/api/activities/get_all_user_activities/${userID}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default fetchAllActivitiesData;
