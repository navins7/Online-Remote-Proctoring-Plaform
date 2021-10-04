import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Webcam from "react-webcam";
import { socket } from "../constants/socket";
import { loginFunc } from "../actions/authentication.action";
import { postRequest } from "../utils/serviceCall";
import { tokenLocalStorageKey } from "../constants/authentication.constant";
import { encrypt } from "../utils/encryptDecrypt";
import "../styles/authentication.css";
import "../styles/Login.css";

const videoConstraints = {
  facingMode: "user",
};

const Login = (props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const authReducer = useSelector((state) => state.authenticationReducer);
  let { user } = authReducer;
  if (user === null) user = {};
  const imageUrl = user ? user.url : "";

  const webcamRef = useRef(null);

  const emailPasswordVerification = () => {
    if (message.length !== 0) setMessage("");
    if (email.length === 0) {
      setError("Email Address cannot be empty");
      return;
    }
    if (password.length === 0) {
      setError("Password cannot be empty");
      return;
    }
    if (error.length !== 0) setError("");
    postRequest("auth/login", { email, password })
      .then((res) => {
        setEmailVerified(true);
        dispatch(loginFunc(res.data.user));
        setIsStudent(res.data.user.isStudent);
      })
      .catch((err) => {
        setError(err.response.data.error);
      });
  };

  const mediaError = () => {
    setError(
      "Please allow access to your webcam and wait for your webcam to start"
    );
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    return imageSrc;
  }, [webcamRef]);

  useEffect(() => {
    const { state = {} } = location;
    const { message: stateMessage } = state;
    if (typeof stateMessage !== "undefined") {
      setMessage(stateMessage);
    }
    if (localStorage.getItem(tokenLocalStorageKey) !== null) {
      if (user.isStudent) history.push("/dashboard");
      else history.push("/inv/dashboard");
    }
  }, [history, location, user.isStudent]);

  useEffect(() => {
    if (emailVerified) {
      const transmitImage = setInterval(() => {
        const imageSrc = capture();
        if (imageSrc) {
          socket.emit(
            "login verification",
            email,
            imageSrc,
            imageUrl,
            (res, token) => {
              if (res && localStorage.getItem(tokenLocalStorageKey) === null) {
                localStorage.setItem(tokenLocalStorageKey, encrypt(token));
                if (isStudent) history.push("/dashboard");
                else history.push("/inv/dashboard");
              }
            }
          );
        }
      }, 1000 / process.env.REACT_APP_FPS);
      return () => clearInterval(transmitImage);
    }
  }, [imageUrl, capture, email, emailVerified, history, isStudent]);

  if (!emailVerified) {
    return (
      <>
        <Link className="goBackLink" to="/">
          <button className="goBackBtn">
            <span style={{ fontSize: "20px", marginRight: "10px" }}>
              &#8592;
            </span>
            <p>Go Back</p>
          </button>
        </Link>
        <div className="container">
          <div className="loginform">
            <h2 className="formhead">Login</h2>
            {error.length !== 0 && <p className="errorMsg">{error}</p>}
            {message.length !== 0 && <p className="successMsg">{message}</p>}
            <label className="label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              className="inp"
              type="email"
              name="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="inp"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="form-submit"
              onClick={emailPasswordVerification}
            >
              Login
            </button>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Link className="goBackLink" to="/">
        <button className="goBackBtn">
          <span style={{ fontSize: "20px", marginRight: "10px" }}>&#8592;</span>
          <p>Go Back</p>
        </button>
      </Link>
      <div className="container">
        <div className="loginform">
          <h2 className="formhead">Facial Verification</h2>
          {error.length !== 0 && <p className="errorMsg">{error}</p>}
          <Webcam
            audio={false}
            videoConstraints={videoConstraints}
            screenshotFormat="image/jpeg"
            ref={webcamRef}
            screenshotQuality={1}
            onUserMediaError={mediaError}
          />
        </div>
      </div>
    </>
  );
};

export { Login };
