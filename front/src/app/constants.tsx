export const serverIP = "localhost";

const setCookie = (name: string, value: string, days?: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  const sameSiteSecure =
    window.location.protocol === "https:" ? "; SameSite=None; Secure" : "";

  document.cookie = `${name}=${value}${expires}; path=/${sameSiteSecure}`;
};

async function refreshToken(serverIP) {
  try {
    const refresh_url = `http://${serverIP}:5000/auth/refresh`;

    const refresh_response = await fetch(refresh_url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (refresh_response.ok) {
      const refresh_data = await refresh_response.json();
      setCookie("jwt_token", refresh_data.jwt_token, 7);
      return true;
    } else {
      console.error("Error refreshing:", await refresh_response.json());
      return false;
    }
  } catch (error) {
    console.error("Network error: ", error);
    return false;
  }
}

export default refreshToken;
