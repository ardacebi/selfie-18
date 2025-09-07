async function fetchAllEventsData({ userID }) {
  if (userID === null) {
    throw new Error("User not found");
  } else {
    const res = await fetch(`/api/events/get_all_user_events/${userID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default fetchAllEventsData;
