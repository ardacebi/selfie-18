async function postDuplicateNote({ noteID, userID, creationDate }) {
  if (!userID) {
    throw new Error("User not found");
  } else if (!noteID) {
    throw new Error("Note ID not provided");
  } else {
    const res = await fetch(`/api/notes/duplicate_note`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        noteID,
        userID,
        creationDate,
      }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default postDuplicateNote;
