import {
  LOGIN,
  LOGOUT,
  tokenLocalStorageKey,
} from "../constants/authentication.constant";

const initialState = {
  user: null,
  isAuthenticated: false,
};

export const authenticationReducer = (
  state = initialState,
  { type, payload }
) => {
  switch (type) {
    case LOGIN: {
      return {
        ...state,
        user: payload.user,
        isAuthenticated: true,
      };
    }
    case LOGOUT: {
      localStorage.removeItem(tokenLocalStorageKey);
      return initialState;
    }
    default:
      return state;
  }
};
