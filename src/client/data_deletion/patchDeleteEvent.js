async function patchDeleteEvent({ eventID, userID }) {
  if (eventID === null) {
    throw new Error("Provide a eventID");
  } else if (userID === null) {
    throw new Error("Provide a userID");
  } else {
    const res = await fetch(`/api/events/delete_event/${eventID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default patchDeleteEvent;
