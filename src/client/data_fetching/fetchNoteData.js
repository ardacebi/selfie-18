async function fetchNoteData({ noteID, userID }) {
  if (noteID === null) {
    throw new Error("Provide a noteID");
  } else if (userID === null) {
    throw new Error("Provide a userID");
  } else {
    const res = await fetch(`/api/notes/get_note_by_id`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ noteID, userID }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default fetchNoteData;
