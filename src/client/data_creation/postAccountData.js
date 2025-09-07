async function postAccountData({ email, username, password }) {
  const res = await fetch(`/api/account/sign_up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, username, password }),
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(`${message}`);
  }

  return res.json();
}

export default postAccountData;
