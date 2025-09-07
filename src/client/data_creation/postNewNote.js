async function postNewNote({
  title,
  creationDate,
  lastModifiedDate,
  body,
  tags,
  userID,
}) {
  if (userID === null) {
    throw new Error("User not found");
  } else {
    const res = await fetch(`/api/notes/create_note/${userID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        creationDate,
        lastModifiedDate,
        body,
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

export default postNewNote;
