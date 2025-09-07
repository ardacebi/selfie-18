async function fetchAllNotesData({ userID }) {
  if (userID === null) {
    throw new Error("User not found");
  } else {
    const res = await fetch(`/api/notes/get_all_user_notes/${userID}`, {
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

export default fetchAllNotesData;
