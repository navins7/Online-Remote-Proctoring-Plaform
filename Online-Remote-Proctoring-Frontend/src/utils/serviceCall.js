import axios from "axios";
import { tokenLocalStorageKey } from "../constants/authentication.constant";
import { decrypt } from "./encryptDecrypt";

const postRequest = (path, data) => {
  const encryptedToken = localStorage.getItem(tokenLocalStorageKey);
  let decryptedToken;
  try {
    decryptedToken = decrypt(encryptedToken);
  } catch (err) {
    decryptedToken = null;
  }
  const AUTH_TOKEN = decryptedToken;
  const absolutePath = process.env.REACT_APP_BACKEND_URL + path;
  return axios.post(absolutePath, data, {
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
  });
};

const getRequest = (path) => {
  const encryptedToken = localStorage.getItem(tokenLocalStorageKey);
  let decryptedToken;
  try {
    decryptedToken = decrypt(encryptedToken);
  } catch (err) {
    decryptedToken = null;
  }
  const AUTH_TOKEN = decryptedToken;
  const absolutePath = process.env.REACT_APP_BACKEND_URL + path;
  return axios.get(absolutePath, {
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
  });
};

export { postRequest, getRequest };
