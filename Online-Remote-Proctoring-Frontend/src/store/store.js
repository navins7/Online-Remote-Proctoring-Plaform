import { applyMiddleware, createStore, combineReducers } from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import throttle from "lodash.throttle";
import { encrypt, decrypt } from "../utils/encryptDecrypt";
import { authenticationReducer } from "../reducers/authentication.reducer";
import { localStorageKey } from "../constants/authentication.constant";

const loadState = () => {
  try {
    const serializedState = localStorage.getItem(localStorageKey);
    if (serializedState === null) {
      return undefined;
    }
    const decryptedState = decrypt(serializedState);
    return JSON.parse(decryptedState);
  } catch (err) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    const encryptedState = encrypt(serializedState);
    localStorage.setItem(localStorageKey, encryptedState);
  } catch {
    // ignore write errors
  }
};

const persistedState = loadState();

let middleware = null;
if (process.env.NODE_ENV === "production") {
  middleware = applyMiddleware(thunk);
} else {
  middleware = applyMiddleware(thunk, logger);
}

const rootReducer = combineReducers({ authenticationReducer });

const store = createStore(rootReducer, persistedState, middleware);

// Save the store every 1.5 seconds

store.subscribe(
  throttle(() => {
    saveState(store.getState());
  }, 1500)
);

export { store };
