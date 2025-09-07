async function postNewEvent({
  title,
  description,
  date,
  eventEnd,
  location,
  type,
  frequencyType,
  frequencyWeekDays,
  repetition,
  userID,
}) {
  if (!userID) {
    throw new Error("User not found");
  } else if (!title || !date || !type) {
    throw new Error("Please provide title, date and type for the event");
  } else {
    const res = await fetch(`/api/events/create_event/${userID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        date,
        eventEnd,
        location,
        type,
        frequencyType,
        frequencyWeekDays,
        repetition,
      }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default postNewEvent;
