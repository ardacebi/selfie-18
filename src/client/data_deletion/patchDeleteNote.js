async function patchDeleteNote({ noteID, userID }) {
  if (noteID === null) {
    throw new Error("Provide a noteID");
  } else if (userID === null) {
    throw new Error("Provide a userID");
  } else {
    const res = await fetch(`/api/notes/delete_note/${noteID}`, {
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

export default patchDeleteNote;
