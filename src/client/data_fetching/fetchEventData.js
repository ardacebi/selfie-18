async function fetchEventData({ eventID, userID }) {
  if (eventID === null) {
    throw new Error("Provide a eventID");
  } else if (userID === null) {
    throw new Error("Provide a userID");
  } else {
    const res = await fetch(`/api/events/get_event_by_id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ eventID, userID }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default fetchEventData;
