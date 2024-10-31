import axios from "axios";
import { BehaviorSubject } from "rxjs";
import * as jwt from "jsonwebtoken";
import { handleErrorResponse } from "../helpers/handle-response";

const API_URL = process.env.VUE_APP_API_URL || "http://localhost:50052/api/v1";
const currentUserSubject = new BehaviorSubject(
  JSON.parse(localStorage.getItem("currentUser"))
);
const currentAuthTokens = new BehaviorSubject(
  JSON.parse(localStorage.getItem("currentTokens"))
);

export const AuthenticationService = {
  login,
  logout,
  refreshAccessToken,
  currentUserSubject: currentUserSubject.asObservable(),
  currentAuthTokensSubject: currentAuthTokens.asObservable(),
  get currentUserValue() {
    return currentUserSubject.value;
  },
  get currentTokensValue() {
    return currentAuthTokens.value;
  },
};

// define the interceptor for axios
axios.interceptors.response.use((response) => {
  return response;
}, handleErrorResponse);

async function login(user) {
  const response = await axios.post(API_URL + "/auth", {
    username: user.username,
    password: user.password,
  });

  if (response.data) {
    currentAuthTokens.next(response.data);
    currentUserSubject.next(jwt.decode(response.data.accessToken));
    localStorage.setItem(
      "currentTokens",
      JSON.stringify(currentAuthTokens.value)
    );
    localStorage.setItem(
      "currentUser",
      JSON.stringify(currentUserSubject.value)
    );
  }

  return response.data;
}

async function refreshAccessToken() {
  const tokens = currentAuthTokens.value;
  console.log(tokens);
  const response = await axios.post(API_URL + "/refresh", {
    refreshToken: tokens.refreshToken, // assuming your API uses this endpoint
  });
  console.log(response.data);
  if (response.data) {
    currentAuthTokens.next(response.data);
    localStorage.setItem(
      "currentTokens",
      JSON.stringify(currentAuthTokens.value)
    );
  }

  return response.data.accessToken; // return the new access token
}

function logout() {
  // localStorage.removeItem("currentTokens");
  // localStorage.removeItem("currentUser");
  // localStorage.removeItem("googleAccessToken");
  // localStorage.removeItem("tokenExpirationTime");

  localStorage.clear();
  currentUserSubject.next(null);
  currentAuthTokens.next(null);
}
