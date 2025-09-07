async function fetchLoginData({ username, password }) {
  const res = await fetch(`/api/account/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const { message } = await res.json();
    throw new Error(`${message}`);
  }

  return res.json();
}

export default fetchLoginData;
