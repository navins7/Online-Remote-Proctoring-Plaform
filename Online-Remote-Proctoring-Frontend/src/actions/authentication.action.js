import { LOGIN, LOGOUT } from "../constants/authentication.constant";

export const loginFunc = (user) => ({
  type: LOGIN,
  payload: { user },
});

export const logoutFunc = () => ({
  type: LOGOUT,
});
