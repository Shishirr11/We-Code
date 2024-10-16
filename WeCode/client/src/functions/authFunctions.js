import { BACKEND_URL } from "../config";

// takes username and returns a boolean
export const isUsernameValid = async (username) => {
  try {
    const sessionToken = localStorage.getItem("sessionToken");
    console.log("session local", sessionToken);
    const response = await fetch(`${BACKEND_URL}/checkUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify({ username, sessionToken }),
    });

    return await response.json();
  } catch (err) {
    return false;
  }
};
