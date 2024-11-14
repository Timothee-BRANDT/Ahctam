export const serverIP = "back";

const getCookie = (name: string): any => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookie = parts.pop();
    if (cookie !== undefined) {
      return cookie.split(";").shift();
    }
  }
  return undefined;
};

const setCookie = (name: string, value: string, minutes?: number) => {
  let expires = "";
  if (minutes) {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  const sameSiteSecure =
    window.location.protocol === "https:" ? "; SameSite=None; Secure" : "";

  document.cookie = `${name}=${value}${expires}; path=/${sameSiteSecure}`;
};

const refreshToken = async (serverIP: string): Promise<string | null> => {
  try {
    const response = await fetch(`http://${serverIP}:5000/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const newToken = data.jwt_token;
    setCookie("jwt_token", newToken, 15);

    return newToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};

const createRefreshClosure = () => {
  const client = async (url: string, options: RequestInit = {}) => {
    try {
      const initialToken = getCookie("jwt_token");
      if (!initialToken || isTokenExpired(initialToken)) {
        const newToken = await refreshToken(serverIP);
        if (!newToken) {
          throw new Error("Token expired and could not be refreshed");
        }
      }

      const currentToken = getCookie("jwt_token");
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${currentToken}`,
        },
      });
      if (response.status === 401) {
        const newToken = await refreshToken(serverIP);
        if (!newToken) {
          throw new Error("Token expired and could not be refreshed");
        }
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      }

      return response;
    } catch (error) {
      window.location.href = "/login";
      throw error;
    }
  };

  return client;
};

export default createRefreshClosure;
