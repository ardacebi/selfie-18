async function patchNoteData({
  noteID,
  userID,
  title,
  lastModifiedDate,
  creationDate,
  body,
  tags = [],
}) {
  if (!noteID) {
    throw new Error("Note ID is required");
  } else if (!userID) {
    throw new Error("User not found");
  } else if (!title || !lastModifiedDate || !creationDate || !body || !tags) {
    throw new Error("All fields are required");
  } else {
    const res = await fetch(`/api/notes/update_note/${noteID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        lastModifiedDate,
        creationDate,
        body,
        userID,
        tags,
      }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default patchNoteData;
