async function postNewPassword({ email, password }) {
  const IDres = await fetch(`/api/account/find_user_id_by_email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!IDres.ok) {
    const { message } = await IDres.json();
    throw new Error(`${message}`);
  }

  const { userID } = await IDres.json();

  if (userID === null) {
    throw new Error("User not found");
  } else {
    const res = await fetch(`/api/account/change_password/${userID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(`${message}`);
    }

    return res.json();
  }
}

export default postNewPassword;
